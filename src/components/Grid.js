import React from 'react';
import Cell from "./Cell";

class Grid extends React.PureComponent {
  render() {
    return (
      <div className="minesweeper__grid-container">
        <div className="minesweeper__grid" onClick={this.props.openCellHandler} onContextMenu={this.props.markMineHandler}>
          {this.props.grid.map((value, key) =>
            <div className="minesweeper__row" key={key}>{
              value.map((value, innerKey) => {
                return <Cell key={innerKey} parentKey={key} cellKey={innerKey} value={value}/>
              })
            }</div>
          )}
        </div>
      </div>
    );
  }
}

export default Grid;
