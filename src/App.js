import React, { Component } from "react";
import "./App.css";
import { Tiles } from "./Tiles";
import { Results } from "./Results";
import { ResetButton } from "./Buttons/ResetButton";
import update from "immutability-helper";

const board = [...Array(8)].map((cur, rowIndex) => {
  return Array.from({ length: 8 }, (c, columnIndex) => {
    let pieces;
    if (rowIndex < 3) {
      pieces = (rowIndex + columnIndex) % 2 !== 0 && "playerOne";
    } else if (rowIndex > 4) {
      pieces = (rowIndex + columnIndex) % 2 !== 0 && "playerTwo";
    }
    return {
      pieces,
      position: `${rowIndex}${columnIndex}`,
      selected: false,
      isKing: false
    };
  });
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      board,
      playerTurn: "playerOne",
      score: [0, 0],
      winner: null,
      remainingP1: 12,
      remainingP2: 12
    };
  }

  setupBoard = () => {
    return this.state.board.map((curRow, rowIndex) => {
      return curRow.map((curTile, columnIndex) => {
        return (
          <Tiles
            row={rowIndex}
            column={columnIndex}
            key={curTile.position}
            values={curTile}
            onClick={this.updateBoard}
          />
        );
      });
    });
  };

  moveSelectedPiece = (position, isCheckerKing, getTileInfo) => {
    // TODO check for possible multiple jumps
    const { board, selectedPiece, playerTurn } = this.state;
    const otherPlayer = playerTurn === "playerOne" ? "playerTwo" : "playerOne";
    const row = +position[0];
    const column = +position[1];
    // return if there is a checker transverse to the next selection (for now)
    if (
      board[row][column].pieces === otherPlayer ||
      board[row][column].pieces === playerTurn
    )
      return;

    //checks for jump moves
    let jumpedLeft,
      jumpedRight,
      jumpedUL,
      jumpedUR,
      jumpedDL,
      jumpedDR,
      jumpedTile,
      isEnemy;

    if (isCheckerKing) {
      jumpedUL = position === getTileInfo(2, 2, "left", "up").position;
      jumpedUR = position === getTileInfo(2, 2, "right", "up").position;
      jumpedDL = position === getTileInfo(2, 2, "left", "down").position;
      jumpedDR = position === getTileInfo(2, 2, "right", "down").position;
      if (jumpedUL) {
        jumpedTile = getTileInfo(1, 1, "left", "up");
      } else if (jumpedUR) {
        jumpedTile = getTileInfo(1, 1, "right", "up");
      } else if (jumpedDL) {
        jumpedTile = getTileInfo(1, 1, "left", "down");
      } else if (jumpedDR) {
        jumpedTile = getTileInfo(1, 1, "right", "down");
      }
    } else {
      jumpedLeft = position === getTileInfo(2, 2, "left").position;
      jumpedRight = position === getTileInfo(2, 2, "right").position;
      if (jumpedLeft || jumpedRight) {
        jumpedTile = jumpedLeft
          ? getTileInfo(1, 1, "left")
          : getTileInfo(1, 1, "right");
      }
    }

    isEnemy = jumpedTile && jumpedTile.pieces === otherPlayer;
    if (isEnemy) {
      const isKing = isCheckerKing ||
        (playerTurn === "playerOne" && +selectedPiece[0] === 5) ||
        (playerTurn === "playerTwo" && +selectedPiece[0] === 2)
        ? true
        : false;
      const playerPieces = playerTurn === "playerOne"
        ? "remainingP2"
        : "remainingP1";

      this.setState({
        board: update(board, {
          [row]: {
            [column]: {
              pieces: { $set: playerTurn },
              isKing: { $set: isKing }
            }
          },
          [jumpedTile["position"][0]]: {
            [jumpedTile["position"][1]]: {
              pieces: { $set: null }
            }
          },
          [selectedPiece[0]]: {
            [selectedPiece[1]]: {
              pieces: { $set: null },
              selected: { $set: false }
            }
          }
        }),
        selectedPiece: "",
        playerTurn: otherPlayer,
        [playerPieces]: this.state[playerPieces] - 1
      });
      return;
    }

    //checks for single moves
    if (isCheckerKing) {
      const movedUpLeft = position === getTileInfo(1, 1, "left", "up").position;
      const movedUpRight =
        position === getTileInfo(1, 1, "right", "up").position;
      const movedDownLeft =
        position === getTileInfo(1, 1, "left", "down").position;
      const movedDownRight =
        position === getTileInfo(1, 1, "right", "down").position;

      if (!movedUpLeft && !movedUpRight && !movedDownLeft && !movedDownRight)
        return;
    } else {
      const movedLeft = position === getTileInfo(1, 1, "left").position;
      const movedRight = position === getTileInfo(1, 1, "right").position;
      if (!movedLeft && !movedRight) return;
    }
    const isKing = board[selectedPiece[0]][selectedPiece[1]].isKing ||
      (playerTurn === "playerOne" && +selectedPiece[0] === 6) ||
      (playerTurn === "playerTwo" && +selectedPiece[0] === 1)
      ? true
      : false;

    this.setState({
      board: update(this.state.board, {
        [row]: {
          [column]: {
            pieces: { $set: playerTurn },
            isKing: { $set: isKing }
          }
        },
        [selectedPiece[0]]: {
          [selectedPiece[1]]: {
            pieces: { $set: null },
            selected: { $set: false }
          }
        }
      }),
      selectedPiece: "",
      playerTurn: otherPlayer
    });
  };

  makeSelection = (position, piece, isKing, getTileInfo) => {
    const { selectedPiece, playerTurn } = this.state;
    const row = +position[0];
    const column = +position[1];
    let possibilityOne = false;
    let possibilityTwo = false;
    let possibilityThree = false;
    let possibilityFour = false;

    function isLegal(xAxis, yAxis) {
      let singleMove = getTileInfo(1, 1, xAxis, yAxis);
      if (singleMove) {
        let isCheckerPiece = singleMove.pieces;
        if (isCheckerPiece) {
          const doubleMove = getTileInfo(2, 2, xAxis, yAxis);
          if (doubleMove && isCheckerPiece !== playerTurn) {
            return doubleMove.pieces ? false : true;
          }
        } else {
          return true;
        }
      }
    }
    if (isKing) {
      possibilityOne = isLegal("left", "up");
      possibilityTwo = isLegal("right", "up");
      possibilityThree = isLegal("left", "down");
      possibilityFour = isLegal("right", "down");
    } else {
      possibilityOne = isLegal("left");
      possibilityTwo = isLegal("right");
    }

    // if both possible spots are occupied by the players checker, that checker cannot be selected
    if (
      !possibilityOne &&
      !possibilityTwo &&
      !possibilityThree &&
      !possibilityFour
    )
      return;
    if (selectedPiece) {
      if (+selectedPiece[0] === row) {
        this.setState({
          board: update(this.state.board, {
            [row]: {
              [column]: {
                selected: { $set: true }
              },
              [selectedPiece[1]]: {
                selected: { $set: false }
              }
            }
          }),

          selectedPiece: position
        });
      } else {
        this.setState({
          board: update(this.state.board, {
            [row]: {
              [column]: {
                selected: { $set: true }
              }
            },
            [selectedPiece[0]]: {
              [selectedPiece[1]]: {
                selected: { $set: false }
              }
            }
          }),

          selectedPiece: position
        });
      }
    } else {
      this.setState({
        board: update(this.state.board, {
          [row]: {
            [column]: {
              selected: { $set: true }
            }
          }
        }),
        selectedPiece: position
      });
    }
  };

  updateBoard = (piece, position, isKing) => {
    const { board, selectedPiece, playerTurn } = this.state;
    const row = +position[0];
    const column = +position[1];
    const isCheckerKing = selectedPiece
      ? board[selectedPiece[0]][selectedPiece[1]].isKing
      : isKing;
    const isSamePlayer = () => {
      return board[row][column].pieces === playerTurn;
    };
    // if there is no saved selection use current selection
    // if there is a saved selection and current selection is a
    function getTileInfo(rowNum, columnNum, xAxis, yAxis) {
      if (!isCheckerKing) yAxis = playerTurn === "playerOne" ? "down" : "up";
      const rowToUse = selectedPiece
        ? isSamePlayer() ? row : +selectedPiece[0]
        : row;
      const columnToUse = selectedPiece
        ? isSamePlayer() ? column : +selectedPiece[1]
        : column;
      const nextRow = yAxis === "down" ? rowToUse + rowNum : rowToUse - rowNum;
      const nextColumn = xAxis === "right"
        ? columnToUse + columnNum
        : columnToUse - columnNum;

      if (nextRow < 0 || nextRow > 7 || nextColumn < 0 || nextColumn > 7)
        return {};
      return board[nextRow][nextColumn];
    }

    // if there is a checker already selected
    if (selectedPiece) {
      if (piece === playerTurn) {
        this.makeSelection(position, piece, isKing, getTileInfo);
      }

      // moves checker to new location if legal
      this.moveSelectedPiece(position, isCheckerKing, getTileInfo);
    } else if (piece === playerTurn) {
      // makes a selection if selected checker is owned by the player and checker has yet to be selected
      this.makeSelection(position, piece, isKing, getTileInfo);
    }
  };

  componentDidUpdate = () => {
    this.checkForWinner();
  };

  checkForWinner = () => {
    const { remainingP1: p1, remainingP2: p2, score } = this.state;
    const winner = !p1 ? "Player 2" : !p2 ? "Player 1" : false;
    const theScore = winner === "Player 1" ? 0 : 1;
    if (winner && !this.state.winner)
      this.setState({
        winner,
        score: update(score, { [theScore]: { $set: score[theScore] + 1 } })
      });
  };

  resetBoard = () => {
    this.setState({
      board,
      playerTurn: "playerOne",
      winner: null,
      selectedPiece: "",
      remainingP1: 12,
      remainingP2: 12
    });
  };

  render() {
    const { playerTurn, score } = this.state;

    return (
      <div className="container">
        <h1>
          <u>React </u>
          <u>Checkers</u>
        </h1>
        <div className="checker">
          <div
          >{`${playerTurn === "playerOne" ? "PLAYER 1's" : "PLAYER 2's"} TURN `}</div>
          <div className={playerTurn} />
          <div className="score">
            <div>{`SCORE: ${score[0]} | ${score[1]}`}</div>
          </div>
        </div>
        <Results winner={this.state.winner} />
        <div className="boardContainer">
          {this.setupBoard()}
          <ResetButton reset={this.resetBoard} />
        </div>
      </div>
    );
  }
}
