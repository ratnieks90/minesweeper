import React from 'react';

const Cell = (props) => {
  return (
    <span
      className={`minesweeper__cell minesweeper__cell--${props.value.type}`}
      id={`${props.cellKey} ${props.parentKey}`}>
      {props.value.value}
    </span>
  )
};

export default Cell;
