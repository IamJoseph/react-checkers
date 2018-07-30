import React from "react";
import "./Tiles.css";

export const Tiles = props => {
  const { values: { pieces, position, selected, isKing }, onClick } = props;

  return (
    <div
      className={`tile ${selected ? "selected" : ""}`}
      onClick={() => onClick(pieces, position, isKing)}
    >
      {pieces && <div className={`${pieces} ${isKing && "king"}`} />}
    </div>
  );
};
