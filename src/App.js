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
    // TODO - create uid other than index
    return this.state.board.map((curRow, rowIndex) => {
      return curRow.map((curTile, columnIndex) => {
        return (
          <Tiles
            row={rowIndex}
            column={columnIndex}
            key={columnIndex}
            values={curTile}
            updateBoard={this.updateBoard}
          />
        );
      });
    });
  };

  updateBoard = (piece, position, isKing) => {
    const {
      board,
      selectedPiece,
      playerTurn,
      remainingP1,
      remainingP2
    } = this.state;
    const row = +position[0];
    const column = +position[1];
    const isCheckerKing = selectedPiece
      ? board[selectedPiece[0]][selectedPiece[1]].isKing
      : isKing;

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

    //TODO get rid of this in favor of getTileInfo
    function getMoveLocation(type) {
      const modNum = selectedPiece ? +selectedPiece : +position;
      const checkForKing = selectedPiece
        ? board[selectedPiece[0]][selectedPiece[1]].isKing
        : isKing;
      if (checkForKing) {
        switch (type) {
          case "singleMoveDownR":
            return (modNum + 11).toString();
          case "singleMoveDownL":
            return (modNum + 9).toString();
          case "jumpMoveDownR":
            return (modNum + 22).toString();
          case "jumpMoveDownL":
            return (modNum + 18).toString();
          case "singleMoveUpR":
            return (modNum - 9).toString();
          case "singleMoveUpL":
            return (modNum - 11).toString();
          case "jumpMoveUpR":
            return (modNum - 18).toString();
          case "jumpMoveUpL":
            return (modNum - 22).toString();
          default:
            break;
        }
      } else if (playerTurn === "playerOne") {
        switch (type) {
          case "singleMoveR":
            return modNum + 11;
          case "singleMoveL":
            return modNum + 9;
          case "jumpMoveR":
            return modNum + 22;
          case "jumpMoveL":
            return modNum + 18;
          default:
            break;
        }
      }
      switch (type) {
        case "singleMoveR":
          return modNum - 9;
        case "singleMoveL":
          return modNum - 11;
        case "jumpMoveR":
          return modNum - 18;
        case "jumpMoveL":
          return modNum - 22;
        default:
          break;
      }
    }
    const otherPlayer = playerTurn === "playerOne" ? "playerTwo" : "playerOne";
    function getTileInfo(rowNum, columnNum, xAxis, yAxis) {
      if (!isCheckerKing) yAxis = playerTurn === "playerOne" ? "down" : "up";
      const rowToUse = selectedPiece ? +selectedPiece[0] : row;
      const columnToUse = selectedPiece ? +selectedPiece[1] : column;
      const nextRow = yAxis === "down" ? rowToUse + rowNum : rowToUse - rowNum;
      const nextColumn = xAxis === "right"
        ? columnToUse + columnNum
        : columnToUse - columnNum;

      if (nextRow < 0 || nextRow > 7 || nextColumn < 0 || nextColumn > 7)
        return;
      return board[nextRow][nextColumn];
    }

    // if there is a checker already selected
    if (selectedPiece) {
      // if next selection is taken by enemy return
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
        jumpedUL =
          getTileInfo(2, 2, "left", "up") &&
          position === getTileInfo(2, 2, "left", "up").position;
        jumpedUR =
          getTileInfo(2, 2, "right", "up") &&
          position === getTileInfo(2, 2, "right", "up").position;
        jumpedDL =
          getTileInfo(2, 2, "left", "down") &&
          position === getTileInfo(2, 2, "left", "down").position;
        jumpedDR =
          getTileInfo(2, 2, "right", "down") &&
          position === getTileInfo(2, 2, "right", "down").position;
        if (jumpedUL) {
          jumpedTile = getTileInfo(1, 1, "left", "up");
          console.log("1");
        } else if (jumpedUR) {
          jumpedTile = getTileInfo(1, 1, "right", "up");
          console.log("2");
        } else if (jumpedDL) {
          jumpedTile = getTileInfo(1, 1, "left", "down");
          console.log("3");
        } else if (jumpedDR) {
          jumpedTile = getTileInfo(1, 1, "right", "down");
          console.log("4");
        }
      } else {
        jumpedLeft =
          getTileInfo(2, 2, "left") &&
          position === getTileInfo(2, 2, "left").position;

        jumpedRight =
          getTileInfo(2, 2, "right") &&
          position === getTileInfo(2, 2, "right").position;
        console.log("jL", jumpedLeft, "jr", jumpedRight);
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
        const piecesLeft = playerTurn === "playerOne"
          ? remainingP1
          : remainingP2;
        console.log("objent", Object.entries(piecesLeft));

        this.setState({
          board: update(this.state.board, {
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
        const movedUpLeft = position === getMoveLocation("singleMoveUpL");
        const movedUpRight = position === getMoveLocation("singleMoveUpR");
        const movedDownLeft = position === getMoveLocation("singleMoveDownL");
        const movedDownRight = position === getMoveLocation("singleMoveDownR");

        if (!movedUpLeft && !movedUpRight && !movedDownLeft && !movedDownRight)
          return;
      } else {
        const movedLeft = +position === getMoveLocation("singleMoveL");
        const movedRight = +position === getMoveLocation("singleMoveR");
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
    }
    // makes a selection if selected checker is owned by the player and a piece has yet to be selected
    // TODO separate into new function
    if (piece === playerTurn && !selectedPiece) {
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
