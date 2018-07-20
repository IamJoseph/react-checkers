import React from "react";
import "./Buttons.css";

export const ResetButton = ({ reset }) => {
  return (
    <div className="buttonsContainer">
      <button className="resetButton" onClick={reset}>Reset</button>
    </div>
  );
};
