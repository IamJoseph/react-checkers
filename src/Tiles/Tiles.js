import React from "react";
import "./Tiles.css";

export const Tiles = props => {
  const {
    location,
    row,
    column,
    player,
    values: { pieces, position, selected },
    updateBoard
  } = props;
  //const color = row % 2 + 1;
  //const color = (row + column) % 2 === 0 ? "red" : "black";
  // console.log(
  //   "loc",
  //   location,
  //   "value",
  //   value,
  //   "color",
  //   color,
  //   "r+c",
  //   row + column
  // );

  return (
    <div
      //className="tile"
      className={`tile ${selected ? "selected" : ""}`}
      onClick={() => updateBoard(pieces, position)}
    >
      {pieces && <div className={pieces} />}
      {/* <p>{value}</p> */}
    </div>
  );
};
