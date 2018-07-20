import React from "react";
import "./Results.css";

export const Results = ({ winner }) => {
  const getAnnouncement = () => {
    if (winner === "Draw") {
      return "It's a Draw!";
    }
    return `Game Over ${winner} Wins!`;
  };
  return (
    <div className={winner ? "gameOver" : "hidden"}>
      <h2>{getAnnouncement()}</h2>
    </div>
  );
};
