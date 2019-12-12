import React from 'react';
import Grid from "../components/Grid";
import _ from "lodash";

const ws = new WebSocket('wss://hometask.eg1236.com/game1/');

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      passwords: ['ThisWasEasy', 'NotSoMuch'],
      grid: [],
      possibleMines: [],
      messages: [],
      freeSpot: {}
    }
  }

  componentDidMount(){
    ws.onopen = () => {
      console.log('Connected successfully')
    };
    ws.onmessage = (event) => {
      //console.log(event.data);
      let parts = event.data.split(':');
      if(parts[0] === 'map'){
        let grid = [];
        //creating two dimensional array
        let blocks = parts[1].trim().replace(/\n/ig, ' ').split(' ');
        blocks.forEach((block, rowKey) => {
          let cells = block.split('')
          let row = [];
          cells.forEach((cell, colKey) => {
            //filling cell object for future calculations
            cell = {
              type: this.__isNumeric(cell) ? 'number' : (cell === '□' ? 'hidden' : 'bomb'),
              corX: rowKey,
              corY: colKey,
              value: cell
            };
            row.push(cell);
          });
          grid.push(row);
        });
        //mark known bombs in map
        for(let i = 0; i < this.state.possibleMines.length; i++){
          let item = this.state.possibleMines[i];
          let bomb = grid[item.row][item.col];
          bomb.type = 'bomb';
        }

        for(let i = 0; i < grid.length; i++) {
          for(let j = 0; j < grid[i].length; j++) {
            let cell = grid[i][j];
            if(cell.type === "number"){
              //find possible neighbors
              let neighbors = this.__findingNeighbors(grid, i, j);

              let hiddenSpots = _.filter(neighbors, { type: 'hidden'});
              let bombs = _.filter(neighbors, { type: 'bomb'});

              this.__markMineAndSafeSpots(hiddenSpots, bombs, parseInt(cell.value))
            }
          }
        }

        let freeSpot = _.find(_.flatten(grid), {'type': 'safe'});

        this.setState({grid: grid}, () => {
          //auto open free spots, maybe need some button to enable/disable this
          if(!!freeSpot) {
            ws.send(`open ${freeSpot.corY} ${freeSpot.corX}`); ws.send('map');
          }

        });
      }
    }
  }
  __markMineAndSafeSpots(hiddenSpots, bombSpots, cellValue) {
    if(bombSpots.length === cellValue) {
      this.__markSafeSpots(hiddenSpots)
    }
    for(let i = 0; i < cellValue; i++) {
      if (hiddenSpots.length === (cellValue - i) && bombSpots.length === i) {
        this.__markMineSpots(hiddenSpots)
      }
    }
  }
  __markSafeSpots(hiddenSpots) {
    hiddenSpots.forEach(item => {
      item.type = 'safe';
    });
  }
  __markMineSpots(hiddenSpots) {
    let possibleMines = [];
    hiddenSpots.forEach(item => {
      item.type = 'bomb';
      if(_.findIndex(this.state.possibleMines, { row: item.corX, col: item.corY }) === -1){
        possibleMines.push({
          row: item.corX,
          col: item.corY,
          type: 'bomb'
        });
      }
    });
    this.setState({possibleMines: [...this.state.possibleMines, ...possibleMines]})
  }
  __findingNeighbors(myArray, i, j) {
    let neighbors = [];
    let rowLimit = myArray.length-1;
    let columnLimit = myArray[0].length-1;

    for(let x = Math.max(0, i-1); x <= Math.min(i+1, rowLimit); x++) {
      for(let y = Math.max(0, j-1); y <= Math.min(j+1, columnLimit); y++) {
        if(x !== i || y !== j) {
          neighbors.push(myArray[x][y]);
        }
      }
    }
    return neighbors;
  }
  __isNumeric(num){
    return !isNaN(num)
  }

  markMineHandler(e){
    e.preventDefault();
    if (e.type === 'click') {
    } else if (e.type === 'contextmenu') {
      e.target.classList.toggle('bomb');
    }
  }
  openCellHandler(cell) {
    ws.send(`open ${cell}`);
    ws.send('map')
  }

  newGame() {
    this.setState({grid: [], possibleMines: [], messages: []});
    ws.send('new 3'); ws.send('map')
  }
  render() {
    return (
      <div className="App" style={{ backgroundColor: 'cadetblue}'}}>
        <span>Mines {this.state.possibleMines.length} </span>
        <button onClick={()=> {ws.send('help')}}>Help</button>
        <button onClick={()=> {ws.send(`open ${this.state.freeSpot.corY} ${this.state.freeSpot.corX}`); ws.send('map')}}>Open free spot</button>

        <button onClick={this.newGame.bind(this)}>new Game</button>
        <Grid grid={this.state.grid} markMineHandler={this.markMineHandler} openCellHandler={this.openCellHandler}/>
      </div>
    );
  }
}

export default App;
