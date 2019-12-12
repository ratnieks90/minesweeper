import React from 'react';
import Cell from "./Cell";

class Grid extends React.PureComponent {
  render() {
    return (
      <div>
        <div style={{backgroundColor: 'cadetblue}'}} onClick={(e) => {this.props.openCellHandler(e.target.id)}} onContextMenu={this.props.markMineHandler}>
          {this.props.grid.map((value, key) =>
            <div key={key} style={{display: 'flex', alignItems: 'center'}}>{
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
