import React from 'react';

const Cell = (props) => {
  return (
    <span
      className={`cell ${props.value.type}`}
      id={`${props.cellKey} ${props.parentKey}`}>
      {props.value.value}
    </span>
  )
};

export default Cell;
