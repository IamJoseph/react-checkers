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
            // pieces={pieces}
            values={curTile}
            updateBoard={this.updateBoard}
            //  player={this.state.player}
          />
        );
      });
    });
  };

  updateBoard = (piece, position) => {
    const { board, selectedPiece, playerTurn } = this.state;
    const row = +position[0];
    const column = +position[1];
    const singleMoveR = playerTurn === "playerOne"
      ? +selectedPiece + 11
      : +selectedPiece - 11;
    const singleMoveL = playerTurn === "playerOne"
      ? +selectedPiece + 9
      : +selectedPiece - 9;
    const jumpMoveR = playerTurn === "playerOne"
      ? +selectedPiece + 22
      : +selectedPiece - 22;
    const jumpMoveL = playerTurn === "playerOne"
      ? +selectedPiece + 18
      : +selectedPiece - 18;
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
          case "prevEnemyR":
            console.log("a");

            return +selectedPiece - 11;
          case "prevEnemyL":
            console.log("b");

            return +selectedPiece - 9;
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
        case "prevEnemyR":
          console.log("c");

          return +selectedPiece + 11;
        case "prevEnemyL":
          console.log("d");

          return +selectedPiece + 9;
        default:
          break;
      }
    }
    const otherPlayer = playerTurn === "playerOne" ? "playerTwo" : "playerOne";
    function checkerCheck(rowNum, columnNum, binaryOp) {
      const nextRow = playerTurn === "playerOne" ? row + rowNum : row - rowNum;
      const nextColumn = binaryOp === "add"
        ? column + columnNum
        : column - columnNum;
      // if (nextRow < 0 || nextRow > 7 || nextColumn < 0 || nextColumn > 7)
      //   return true;
      console.log("nextRow", nextRow, "nextColumn", nextColumn);

      return board[nextRow][nextColumn].pieces;
    }

    /** 
     * TODO 
     * check if another of same piece ahead
     * reset if correct player turn but different legal piece
     * check if enemy piece ahead
     * check if player has to make move
     * check if there are multiple jumps
     * check if kinged
    */

    // if there is a checker already selected and the next selection's tile is diagonal
    if (selectedPiece) {
      // if next selection is taken by enemy return
      if (board[row][column].pieces === otherPlayer) return;

      //checks for jump moves
      const movedLeft = +position === getMoveLocation("jumpMoveL");
      const movedRight = +position === getMoveLocation("jumpMoveR");
      if (movedLeft || movedRight) {
        const jumpedTile = movedLeft
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
                  //selected: { $set: false }
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
      // const left = jumpMoveL;
      // const right = jumpMoveR;
      // console.log(
      //   "left",
      //   left,
      //   "right",
      //   right,
      //   singleMoveL,
      //   singleMoveR,
      //   "position",
      //   position,
      //   +position === singleMoveR
      // );

      // const isTwoAway =
      //   Math.abs(row - selectedPiece[0]) === 2 &&
      //   Math.abs(column - selectedPiece[1]) === 2;
      // if (isTwoAway) {
      //   //console.log("pls", row - +selectedPiece[0] > 0);
      //   const isPrevEnemy1 = checkerCheck(-1, -1, "add");
      //   // if ()
      //   const isPrevEnemy2 = checkerCheck(-1, -1, "sub");
      //   console.log("asdlfkj", isPrevEnemy1, isPrevEnemy2);

      //   const isPrevEnemy =
      //     checkerCheck(-1, -1, "add") || checkerCheck(-1, -1, "sub");
      //   return isPrevEnemy ? true : false;
      // }

      // if (isValidJump()) {
      //   this.setState({
      //     board: update(this.state.board, {
      //       [row]: {
      //         [column]: {
      //           pieces: { $set: playerTurn }
      //         }
      //       },
      //       [selectedPiece[0]]: {
      //         [selectedPiece[1]]: {
      //           pieces: { $set: null },
      //           selected: { $set: false }
      //         }
      //       }
      //     }),
      //     selectedPiece: "",
      //     playerTurn: otherPlayer
      //   });
      //   return;
      // }
      // if (board[row - 1][column].pieces === otherPlayer) return;
      if (+position !== singleMoveR && +position !== singleMoveL) return;
      console.log(
        "row",
        row,
        "column",
        column,
        "board",
        board[row][column].pieces
      );

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
      function isLegal() {
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
      }
      isLegal();

      console.log(
        "right spot avail",
        possibilityOne,
        "left spot avail",
        possibilityTwo
      );
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

  checkForWinner = (currentBoard, player) => {
    // const tileCombinations = [
    //   currentBoard[0] + currentBoard[1] + currentBoard[2],
    //   currentBoard[3] + currentBoard[4] + currentBoard[5],
    //   currentBoard[6] + currentBoard[7] + currentBoard[8],
    //   currentBoard[0] + currentBoard[3] + currentBoard[6],
    //   currentBoard[1] + currentBoard[4] + currentBoard[7],
    //   currentBoard[2] + currentBoard[5] + currentBoard[8],
    //   currentBoard[0] + currentBoard[4] + currentBoard[8],
    //   currentBoard[2] + currentBoard[4] + currentBoard[6]
    // ];
    //  Check for a winner or a draw
    // if (/XXX|OOO/.test([...tileCombinations])) {
    //   this.setState({ winner: player });
    //   return;
    // } else if (tileCombinations.every(c => c.length === 3)) {
    //   this.setState({ winner: "Draw" });
    //   return;
    // }
  };

  resetBoard = () => {
    this.setState({
      board,
      playerTurn: "playerOne",
      winner: null
    });
  };

  render() {
    const { playerTurn } = this.state;
    // console.log("rows", this.state.gameBoard);
    //console.log("rows", this.state.rows);

    return (
      <div className="container">
        <h1>
          <u>React </u>
          <u>Checkers</u>
        </h1>
        <div>
          {`${playerTurn === "playerOne" ? "Player 1's" : "Player 2's"} turn`}
        </div>
        <Results winner={this.state.winner} />
        <div className="boardContainer">
          {/* {this.state.gameBoard.map(this.renderTiles)} */}
          {this.setupBoard()}
          <ResetButton reset={this.resetBoard} />
        </div>
      </div>
    );
  }
}
