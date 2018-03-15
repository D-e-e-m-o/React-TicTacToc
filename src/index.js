import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
	let textColor = "";
	if(props.isWinSquare){
		textColor = "red";
	}
	return (
		<button className="square" onClick={props.onClick} style={{color: textColor}}>
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square
				key={i}
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
				isWinSquare={this.props.winLine.includes(i)}
			/>
		);
	}
	
	render() {
		let indents = [];
		let boardRow = [];
		for(var i=0; i<=6; i+=3){
			boardRow = [];
			for(var j=0; j<3; j++){
				boardRow.push(this.renderSquare(i+j));
			}
			indents.push(<div className={"board-row"} key={ 'row'+(i/3) }>{boardRow}</div>);
		}
		return (
			<div>{indents}</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
				step: '',
				fontWeight: "normal",
			}],
			xIsNext: true,
			stepNumber: 0,
			reverseHistoryList: false,
			winLine: [],
		};
	}
	
	calculateWinner(squares) {
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
				if(this.state.winLine.length === 0) {
					this.setState({
						winLine: lines[i],
					});
				}
				return squares[a];
			}
		}
		if(this.state.winLine.length > 0) {
			this.setState({
				winLine: [],
			});
		}
		return null;
	}
	
	handleClick(i) {
		let history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		//TODO:slice方法复制array会改变原数组的状态
		history[history.length - 1].fontWeight = "normal";
		if(this.calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		const row = parseInt(i/3, 10) + 1;
		const col = i%3 + 1;
		const step = '(' + row + ',' + col + ')';
		this.setState({
			history: history.concat([{
				squares: squares,
				step: step,
				winLine: [],
			}]),
			xIsNext: !this.state.xIsNext,
			stepNumber: history.length,
		});
	}
	
	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0,
		});
		let history = this.state.history.slice();
		//TODO:同上
		history.forEach(function (t, i) {
			t.fontWeight = (i === step) ? "bold" : "normal";
		});
		this.setState({
			history: history,
		});
	}
	
	reverseHistory(){
		this.setState({
			reverseHistoryList: !(this.state.reverseHistoryList),
		})
	}
	
	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = this.calculateWinner(current.squares);
		
		let moves = history.map((step, move) => {
			const desc = move ?
				'Go to move #' + move + ':' + history[move].step :
				'Go to game start';
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)} style={{fontWeight: history[move].fontWeight}}>{desc}</button>
				</li>
			);
		});
		if(this.state.reverseHistoryList){
			moves.reverse();
		}
		
		let status;
		if (winner) {
			status = 'Winner: ' + winner;
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}
		
		return (
			<div className="game">
				<div className="game-board">
					<Board
						squares={current.squares}
						onClick={(i) => this.handleClick(i)}
						winLine={this.state.winLine}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<div>
						<button onClick={() => this.reverseHistory()}>reverse history list</button>
					</div>
					<ol reversed={this.state.reverseHistoryList}>{moves}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);
