import React from 'react';
import Grid from '../components/Grid'
import Header from '../components/Header';
import { CONNECTION_STRING } from '../constants';
import _ from 'lodash';
import '../styles/main.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwords: ['ThisWasEasy', 'NotSoMuch'],
      serverConnected: true,
      grid: [],
      possibleMines: [],
      message: '',
      freeSpot: {},
      selectedLevel: null,
      socket: new WebSocket(CONNECTION_STRING)
    }
  }

  componentDidMount() {
    this.state.socket.onopen = () => {
      this.setState({serverConnected: true})
    };
    this.state.socket.onmessage = (event) => {
      console.log(event.data);
      let response = event.data.split(':');
      switch (response[0]) {
        case 'new':
          //if new game created then fetch map details
          if (response[1].trim() === 'OK') {
            this.state.socket.send('map');
          }
          break;
        case 'map':
          let grid = [];
          //creating two dimensional array
          let blocks = response[1].trim().replace(/\n/ig, ' ').split(' ');
          blocks.forEach((block, rowKey) => {
            let cells = block.split('');
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
          for (let i = 0; i < this.state.possibleMines.length; i++) {
            let item = this.state.possibleMines[i];
            let bomb = grid[item.row][item.col];
            bomb.type = 'bomb';
          }

          for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
              let cell = grid[i][j];
              if (cell.type === 'number') {
                //find possible neighbors
                let neighbors = this.__findingNeighbors(grid, i, j);

                let hiddenSpots = _.filter(neighbors, {type: 'hidden'});
                let bombs = _.filter(neighbors, {type: 'bomb'});

                this.__markMineAndSafeSpots(hiddenSpots, bombs, parseInt(cell.value))
              }
            }
          }
          this.setState({grid: grid}, () => {
            //auto open free spots, maybe need some button to enable/disable this
            /*let freeSpot = _.find(_.flatten(grid), {'type': 'safe'});
            if(!!freeSpot) {
              this.state.socket.send(`open ${freeSpot.corY} ${freeSpot.corX}`);
            }*/

          });
          break;
        case 'open':
          this.state.socket.send('map');
          if (response[1].trim() === 'You lose') {
            this.setState({message: `${response[1]}`})
          } else if (response[1].trim() !== 'OK' && response[1].trim() !== 'You lose') {
            this.setState({message: `${response[1]} ${response[2]}`})
          }
          break;
      }

    }
  }

  __markMineAndSafeSpots(hiddenSpots, bombSpots, cellValue) {
    if (bombSpots.length === cellValue) {
      this.__markSafeSpots(hiddenSpots)
    }
    for (let i = 0; i < cellValue; i++) {
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
      if (_.findIndex(this.state.possibleMines, {row: item.corX, col: item.corY}) === -1) {
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
    let rowLimit = myArray.length - 1;
    let columnLimit = myArray[0].length - 1;

    for (let x = Math.max(0, i - 1); x <= Math.min(i + 1, rowLimit); x++) {
      for (let y = Math.max(0, j - 1); y <= Math.min(j + 1, columnLimit); y++) {
        if (x !== i || y !== j) {
          neighbors.push(myArray[x][y]);
        }
      }
    }
    return neighbors;
  }

  __isNumeric(num) {
    return !isNaN(num)
  }

  markMineHandler(e) {
    e.preventDefault();
    if (e.type === 'click') {
    } else if (e.type === 'contextmenu') {
      e.target.classList.toggle('bomb');
    }
  }

  openCellHandler(e) {
    this.state.socket.send(`open ${e.target.id}`);
  }

  restartGame() {
    if (this.state.serverConnected) {
      //reset all data
      this.setState({grid: [], possibleMines: [], message: null, freeSpot: {}}, () => {
        this.state.socket.send(`new ${this.state.selectedLevel}`);
      });
    }
  }

  changeLevel(e) {
    this.setState({selectedLevel: e.target.value, grid: [], possibleMines: [], message: null, freeSpot: {}}, () => {
      if (this.state.serverConnected) {
        this.state.socket.send(`new ${this.state.selectedLevel}`)
      }
    });
  }

  render() {
    return (
      <div className="minesweeper">
        <Header
          mineCounter={this.state.possibleMines.length}
          selectedLevel={this.state.selectedLevel}
          message={this.state.message}
          changeLevel={this.changeLevel.bind(this)}
          restartGame={this.restartGame.bind(this)}
        />
        {this.state.grid.length === 0 ?
          (!!!this.state.selectedLevel ? <div className="minesweeper__placeholder">Please select Level</div>
            : <div className="minesweeper__placeholder">Loading level...</div>)
          :
          <Grid
            grid={this.state.grid}
            markMineHandler={this.markMineHandler.bind(this)}
            openCellHandler={this.openCellHandler.bind(this)}
          />
        }
      </div>
    );
  }
}

export default App;
