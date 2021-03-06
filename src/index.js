import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function Square(props) {
  return (
    <button className={'square ' + (props.winner ? 'winHighlight' : '')} onClick={props.onClick} >
      { props.value}
    </button >
  );
}

const Board = (props) => {
  let boards = [];
  for (let i = 0; i < 3; i++) {
    let rows = [];
    for (let j = 0; j < 3; j++) {
      rows.push(renderSquare(i * 3 + j, props));
    }
    boards.push(<div key={i} className="board-row">{rows}</div>);
  }
  return (
    <div>{boards}</div>
  );
}

function renderSquare(i, props) {
  const isWin = props.wins.includes(i);
  return (
    <Square
      value={props.squares[i]}
      onClick={() => props.onClick(i)}
      winner={isWin}
    />
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: Array(9).fill(null)
      }],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();//引数なしSlice全体をコピー
    const position = current.position.slice();
    if (calculateWinner(squares).result || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    position[history.length - 1] = i;
    this.setState({
      history: history.concat([{
        squares: squares,
        position: position
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const calResult = calculateWinner(current.squares);
    const winner = calResult.result;
    const wins = calResult.wins;

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      if (this.state.stepNumber === 9) {
        status = 'Draw';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            wins={wins}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <History history={this.state.history} stepNumber={this.state.stepNumber} jumpTo={step => { this.jumpTo(step); }} />
        </div>
      </div>
    );
  }
}

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sort: false };
    this.sortHistory = this.sortHistory.bind(this);//???
  }

  sortHistory() {
    this.setState({
      sort: !this.state.sort
    });
  }

  render() {
    const history = this.props.history;
    let moves = history.map((step, move) => { //[{},...,{}] step中身, move場所
      const col = parseInt(step.position[move - 1] % 3);
      const row = parseInt(step.position[move - 1] / 3);
      const desc = move ?
        `Go to move # ${move} ROW:${row} COL${col}` :
        'Go to game start';
      const selected = (move === this.props.stepNumber);
      return (
        <li className="historyList" key={move}>
          <button onClick={() => this.props.jumpTo(move)}>
            {selected ? <b>{desc}</b> : desc}
          </button>
        </li>
      );
    });

    if (this.state.sort) {
      moves = moves.slice(0).reverse();
    }

    return (
      <div>
        <ol>{moves}</ol>
        <button onClick={this.sortHistory}>
          Sort
        </button>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        result: squares[a],
        wins: lines[i]
      };
    }
  }
  return {
    result: null,
    wins: Array(3).fill(null)
  };
}
