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

  updateBoard = (piece, position, isKing) => {
    const { board, selectedPiece, playerTurn } = this.state;
    const row = +position[0];
    const column = +position[1];
    console.log("huh?", isKing);

    function getMoveLocation(type) {
      const modNum = selectedPiece ? +selectedPiece : +position;
      // console.log("king?", isKing);
      console.log("asdlfkjasdfklj", isKing);
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
    // TODO replace with getMoveLocation function
    function checkerCheck(rowNum, columnNum, binaryOp) {
      const nextRow = playerTurn === "playerOne" ? row + rowNum : row - rowNum;
      const nextColumn = binaryOp === "add"
        ? column + columnNum
        : column - columnNum;
      // console.log(
      //   "nextR",
      //   nextRow,
      //   "column",
      //   column,
      //   "columnNum",
      //   columnNum,
      //   "nextColumn",
      //   nextColumn
      // );

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
      console.log("isKing", isKing, selectedPiece[0], selectedPiece[1]);

      if (board[selectedPiece[0]][selectedPiece[1]].isKing) {
        const movedUpLeft = position === getMoveLocation("singleMoveUpL");
        const movedUpRight = position === getMoveLocation("singleMoveUpR");
        const movedDownLeft = position === getMoveLocation("singleMoveDownL");
        const movedDownRight = position === getMoveLocation("singleMoveDownR");
        //console.log("movedL", movedLeft, "movedRight", movedRight);
        console.log(
          "is kinggg",
          position,
          movedDownRight,
          getMoveLocation("singleMoveDownR")
        );

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
      console.log("we got here");

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
      let sL = getMoveLocation("singleMoveL").toString();
      let sR = getMoveLocation("singleMoveR").toString();
      //   let onceMore = getMoveLocation("singleMoveL").toString();
      function isLegal(pos) {
        if (
          //checking out of bounds and negative numbers
          pos.length > 2 ||
          pos < 0 ||
          pos[0] < 0 ||
          pos[0] > 7 ||
          pos[1] < 0 ||
          pos[1] > 7
        )
          return false;
        return true;
      }
      if (isKing) {
        let sUL = getMoveLocation("singleMoveUpL");
        let sUR = getMoveLocation("singleMoveUpR");
        let sDL = getMoveLocation("singleMoveDownL");
        let sDR = getMoveLocation("singleMoveDownR");
        if (isLegal(sUL)) {
          console.log("sUL", sUL);
          if (sUL.length === 1) sUL = "0" + sUL;
          let isChecker = board[sUL[0]][sUL[1]].pieces;
          if (isChecker) {
            let dUL = getMoveLocation("jumpMoveUpL");
            if (isLegal(dUL) && isChecker !== playerTurn) {
              if (dUL.length === 1) dUL = "0" + dUL;
              console.log("dUL", dUL);

              possibilityOne = board[dUL[0]][dUL[1]].pieces ? false : true;
            }
          } else {
            possibilityOne = true;
          }
        }
        if (isLegal(sUR)) {
          console.log("sUR", sUR);
          if (sUR.length === 1) sUR = "0" + sUL;
          let isChecker = board[sUR[0]][sUR[1]].pieces;
          if (isChecker) {
            let dUR = getMoveLocation("jumpMoveUpR");
            if (isLegal(dUR) && isChecker !== playerTurn) {
              if (dUR.length === 1) dUR = "0" + dUR; //can't do this
              console.log("durrrrr", dUR);

              possibilityTwo = board[dUR[0]][dUR[1]].pieces ? false : true;
            }
          } else {
            possibilityTwo = true;
          }
        }
        if (isLegal(sDL)) {
          console.log("sDL", sDL);
          let isChecker = board[sDL[0]][sDL[1]].pieces;
          if (isChecker) {
            const dDL = getMoveLocation("jumpMoveDownL");
            if (isLegal(dDL) && isChecker !== playerTurn) {
              possibilityThree = board[dDL[0]][dDL[1]].pieces ? false : true;
            }
          } else {
            possibilityThree = true;
          }
        }
        if (isLegal(sDR)) {
          console.log("sDR", sDR);
          let isChecker = board[sDR[0]][sDR[1]].pieces;
          if (isChecker) {
            const dDR = getMoveLocation("jumpMoveDownR").toString();
            if (isLegal(dDR) && isChecker !== playerTurn) {
              possibilityFour = board[dDR[0]][dDR[1]].pieces ? false : true;
            }
          } else {
            possibilityFour = true;
          }
        }
      } else {
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

  // checkForWinner = () => {
  // };

  resetBoard = () => {
    this.setState({
      board,
      playerTurn: "playerOne",
      winner: null,
      selectedPiece: ""
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
