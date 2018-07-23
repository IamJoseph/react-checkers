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
      const modNum = selectedPiece ? +selectedPiece : +position;
      console.log("pos", position, modNum);

      if (playerTurn === "playerOne") {
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
        // case "singleMoveR":
        //   return modNum - 11;
        // case "singleMoveL":
        //   return modNum - 9;
        // case "jumpMoveR":
        //   return modNum - 22;
        // case "jumpMoveL":
        //   return modNum - 18;
        default:
          break;
      }
    }
    const otherPlayer = playerTurn === "playerOne" ? "playerTwo" : "playerOne";
    // TODO replace with getMoveLocation function
    function checkerCheck(rowNum, columnNum, binaryOp) {
      // if (
      //   (binaryOp === "add" && column >= 7) ||
      //   (binaryOp === "sub" && column <= 0)
      // ) {
      //   console.log("is this true");

      //   return true;
      // }
      const nextRow = playerTurn === "playerOne" ? row + rowNum : row - rowNum;
      const nextColumn = binaryOp === "add"
        ? column + columnNum
        : column - columnNum;
      console.log(
        "nextR",
        nextRow,
        "column",
        column,
        "columnNum",
        columnNum,
        "nextColumn",
        nextColumn
      );

      // needs to check if the next column/row is <0 or >7
      return board[nextRow][nextColumn].pieces;
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
      const jumpedLeft = +position === getMoveLocation("jumpMoveL");
      const jumpedRight = +position === getMoveLocation("jumpMoveR");
      if (jumpedLeft || jumpedRight) {
        const jumpedTile = jumpedLeft
          ? getMoveLocation("singleMoveL").toString()
          : getMoveLocation("singleMoveR").toString();

        const isEnemy =
          board[jumpedTile[0]][jumpedTile[1]].pieces === otherPlayer;
        if (isEnemy) {
          const isKing = (playerTurn === "playerOne" &&
            +selectedPiece[0] === 5) ||
            (playerTurn === "playerTwo" && +selectedPiece[0] === 2)
            ? true
            : false;
          console.log("we jumped", playerTurn, selectedPiece[0]);

          this.setState({
            board: update(this.state.board, {
              [row]: {
                [column]: {
                  pieces: { $set: playerTurn },
                  isKing: { $set: isKing }
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
      const isKing = (playerTurn === "playerOne" && +selectedPiece[0] === 6) ||
        (playerTurn === "playerTwo" && +selectedPiece[0] === 1)
        ? true
        : false;
      console.log(
        "playerTurn",
        playerTurn,
        "selectedpiece",
        selectedPiece[0],
        "iseq",
        +selectedPiece[0] === 1
      );

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
      let sL = getMoveLocation("singleMoveL").toString();
      let sR = getMoveLocation("singleMoveR").toString();
      function isLegal(pos) {
        console.log("pos", pos);

        if (pos[0] < 0 || pos[0] > 7 || pos[1] < 0 || pos[1] > 7) return false;
        return true;
      }
      //position is what we are trying to select
      //if (sL[0] < 0 || sL[0] > 7 || sL[1] < 0 || sL[1] > 7) insideBoardLeft = false;
      //if (sR[0] < 0 || sR[0] > 7 || sR[1] < 0 || sR[1] > 7) insideBoardRight = false;
      //console.log("sL", sL, sR);
      if (isLegal(sL)) {
        console.log("sL", sL);

        let isChecker = checkerCheck(1, 1, "sub");
        if (isChecker) {
          const dL = getMoveLocation("jumpMoveL").toString();
          if (isLegal(dL) && isChecker !== playerTurn) {
            possibilityOne = checkerCheck(2, 2, "sub") ? false : true;
          }
        } else {
          possibilityOne = true;
        }
      }
      if (isLegal(sR)) {
        console.log("sr", sR);

        let isChecker = checkerCheck(1, 1, "add");
        if (isChecker) {
          const dR = getMoveLocation("jumpMoveR").toString();
          if (isLegal(dR) && isChecker !== playerTurn) {
            possibilityTwo = checkerCheck(2, 2, "add") ? false : true;
          }
        } else {
          possibilityTwo = true;
        }
      }

      // let isChecker = checkerCheck(1, 1, "add");
      // console.log("1", isChecker);
      // if (isChecker) {
      //   //this means the next piece is an enemy
      //   if (column <= 5 && row > 1 && isChecker !== playerTurn) {
      //     possibilityOne = checkerCheck(2, 2, "add") ? false : true;
      //   } else {
      //     //the diagonal checker is yours
      //     possibilityOne = false;
      //   }
      // } else {
      //   possibilityOne = true;
      // }
      // let isChecker = checkerCheck(1, 1, "sub");
      // console.log("2", isChecker);
      // if (isChecker) {
      //   //this means the next piece is an enemy
      //   // row > 1 only necessary for player1
      //   if (column > 1 && row > 1 && isChecker !== playerTurn) {
      //     possibilityTwo = checkerCheck(2, 2, "sub") ? false : true;
      //   } else {
      //     //the diagonal checker is yours
      //     possibilityTwo = false;
      //   }
      // } else {
      //   possibilityTwo = true;
      // }
      // console.log("pos1", possibilityOne, "pos2", possibilityTwo);

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
