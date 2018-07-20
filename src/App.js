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
      //  gameBoard: Array.from({ length: 64 }),
      rows: board,
      player: "X",
      winner: null
    };
  }

  setupBoard = () => {
    return this.state.rows.map((curRow, rowIndex) => {
      return curRow.map((curTile, columnIndex) => {
        return (
          <Tiles
            row={rowIndex}
            column={columnIndex}
            key={columnIndex}
            // pieces={pieces}
            values={curTile}
            updateBoard={this.updateBoard}
            player={this.state.player}
          />
        );
      });
    });
  };

  updateBoard = (piece, position) => {
    const row = position[0];
    const column = position[1];
    const { selectedPiece } = this.state;
    // check if current players turn and checker is present
    // make selection
    // check if next selection is valid
    console.log(
      "piece",
      !piece,
      "position",
      position,
      "selectedPiece",
      selectedPiece
    );

    if (
      selectedPiece &&
      (+position === selectedPiece - 11 || +position === selectedPiece - 9)
    ) {
      console.log("herro");

      this.setState({
        rows: update(this.state.rows, {
          [row]: {
            [column]: {
              pieces: { $set: "playerTwo" }
              //    selected: { $set: true }
            }
          },
          [selectedPiece[0]]: {
            [selectedPiece[1]]: {
              pieces: { $set: null },
              selected: { $set: false }
            }
          }
        }),
        selectedPiece: ""
      });
    }

    if (piece && !selectedPiece) {
      this.setState({
        rows: update(this.state.rows, {
          [row]: {
            [column]: {
              selected: { $set: true }
            }
          }
        }),
        selectedPiece: position
      });
    }
    //}
    //const { gameBoard } = this.state;

    // Check if tile has already been taken
    // if (gameBoard[location]) {
    //   return;
    // }

    // const currentGameBoard = Object.assign([...gameBoard], {
    //   [location]: player
    // });

    // this.setState({ gameBoard: currentGameBoard });
    // this.checkForWinner(currentGameBoard, player);
    // Swith to other players turn
    //  this.setState({ player: this.state.player === "X" ? "O" : "X" });
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
      gameBoard: Array.from({ length: 9 }),
      player: "X",
      winner: null
    });
  };

  render() {
    // console.log("rows", this.state.gameBoard);
    //console.log("rows", this.state.rows);

    return (
      <div className="container">
        <h1>
          <u>React </u>
          <u>Checkers</u>
        </h1>
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
