import {LEVELS} from "../constants";
import React from "react";

const Header = ({mineCounter, selectedLevel, changeLevel, restartGame, message}) => {
  return (
    <div className="minesweeper__header">
      <select value={selectedLevel || ''} onChange={changeLevel} className="minesweeper__select-level">
        <option value="">Choose level</option>
        <option value={LEVELS.levelOne}>Level 1</option>
        <option value={LEVELS.levelTwo}>Level 2</option>
        <option value={LEVELS.levelThree}>Level 3</option>
        <option value={LEVELS.levelFour}>Level 4</option>
      </select>
      {!!selectedLevel &&
      <span className="minesweeper__counter">Mines {mineCounter} </span>
      }
      {!!selectedLevel &&
      <button className="minesweeper__restart" onClick={restartGame}>Restart</button>
      }
      <h2 className="minesweeper__result">{message}</h2>
    </div>
  )
};

export default Header;