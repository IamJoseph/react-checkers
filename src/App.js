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
      winner: null
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

  updateBoard = (piece, position) => {
    const { board, selectedPiece, playerTurn } = this.state;
    const row = +position[0];
    const column = +position[1];
    function getMoveLocation(type) {
      if (playerTurn === "playerOne") {
        switch (type) {
          case "singleMoveR":
            return +selectedPiece + 11;
          case "singleMoveL":
            return +selectedPiece + 9;
          case "jumpMoveR":
            return +selectedPiece + 22;
          case "jumpMoveL":
            return +selectedPiece + 18;
          default:
            break;
        }
      }
      switch (type) {
        case "singleMoveR":
          return +selectedPiece - 11;
        case "singleMoveL":
          return +selectedPiece - 9;
        case "jumpMoveR":
          return +selectedPiece - 22;
        case "jumpMoveL":
          return +selectedPiece - 18;
        default:
          break;
      }
    }
    const otherPlayer = playerTurn === "playerOne" ? "playerTwo" : "playerOne";
    // TODO replace with getMoveLocation function
    function checkerCheck(rowNum, columnNum, binaryOp) {
      const nextRow = playerTurn === "playerOne" ? row + rowNum : row - rowNum;
      const nextColumn = binaryOp === "add"
        ? column + columnNum
        : column - columnNum;
      return board[nextRow][nextColumn].pieces;
    }

    // if there is a checker already selected
    if (selectedPiece) {
      // if next selection is taken by enemy return
      if (board[row][column].pieces === otherPlayer) return;

      //checks for jump moves
      const jumpedLeft = +position === getMoveLocation("jumpMoveL");
      const jumpedRight = +position === getMoveLocation("jumpMoveR");
      if (jumpedLeft || jumpedRight) {
        const jumpedTile = jumpedLeft
          ? getMoveLocation("singleMoveL").toString()
          : getMoveLocation("singleMoveR").toString();

        const isEnemy =
          board[jumpedTile[0]][jumpedTile[1]].pieces === otherPlayer;

        if (isEnemy) {
          this.setState({
            board: update(this.state.board, {
              [row]: {
                [column]: {
                  pieces: { $set: playerTurn }
                }
              },
              [jumpedTile[0]]: {
                [jumpedTile[1]]: {
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
            playerTurn: otherPlayer
          });
          return;
        }
        return;
      }

      //checks for single moves
      const movedLeft = +position === getMoveLocation("singleMoveL");
      const movedRight = +position === getMoveLocation("singleMoveR");
      if (!movedLeft && !movedRight) return;

      this.setState({
        board: update(this.state.board, {
          [row]: {
            [column]: {
              pieces: { $set: playerTurn }
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
    if (piece === playerTurn && !selectedPiece) {
      let possibilityOne = false;
      let possibilityTwo = false;

      if (column < 7) {
        let isChecker = checkerCheck(1, 1, "add");
        if (isChecker) {
          //this means the next piece is an enemy
          if (column < 6 && isChecker !== playerTurn) {
            possibilityOne = checkerCheck(2, 2, "add") ? false : true;
            console.log(" is next tile avail checkerCheck2", isChecker);
          } else {
            //the diagonal checker is yours
            possibilityOne = false;
          }
        } else {
          //the space is free
          possibilityOne = true;
        }
      }
      if (column > 0) {
        let isChecker = checkerCheck(1, 1, "sub");
        possibilityTwo = isChecker ? false : true;
        if (isChecker) {
          //this means the next piece is an enemy
          if (column > 1 && isChecker !== playerTurn) {
            possibilityTwo = checkerCheck(2, 2, "sub") ? false : true;
            console.log(" is next tile avail checkerCheck2", isChecker);
          } else {
            //the diagonal checker is yours
            possibilityTwo = false;
          }
        } else {
          //the space is free
          possibilityTwo = true;
        }
      }

      // if both possible spots are occupied by the players checker, that checker cannot be selected
      if (!possibilityOne && !possibilityTwo) return;
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

  // checkForWinner = () => {
  // };

  resetBoard = () => {
    this.setState({
      board,
      playerTurn: "playerOne",
      winner: null
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
