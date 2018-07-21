import React from "react";
import "./Tiles.css";

export const Tiles = props => {
  const {
    location,
    row,
    column,
    player,
    values: { pieces, position, selected, isKing },
    updateBoard
  } = props;

  return (
    <div
      //className="tile"
      className={`tile ${selected ? "selected" : ""}`}
      onClick={() => updateBoard(pieces, position)}
    >
      {pieces && <div className={`${pieces} ${isKing && "king"}`} />}
      {/* <p>{value}</p> */}
    </div>
  );
};
