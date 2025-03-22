import * as Grid from '/sudoku/grid.mjs';

let randomGrid = new Grid.Grid(Grid.Difficulty.EASY);

let board = document.getElementById('board');
populateBoard(board);
refreshCells(randomGrid);

function populateBoard(board) {
	for (let i = 0; i < 9; ++i) {
		let square = populateBoard_createSquare();
		board.appendChild(square);
	}
}

function populateBoard_createSquare() {
	let square = document.createElement('div');
	square.className = 'square';
	for (let i = 0; i < 9; ++i) {
		let cell = document.createElement('p');
		cell.className = 'cell';
		square.appendChild(cell)
	}
	return square;
}

function refreshCells(grid) {
	let squares = Array.from(board.querySelectorAll('.square'));
	for (let [squareIndex, square] of Object.entries(squares)) {
		squareIndex = parseInt(squareIndex);
		let cells = Array.from(square.querySelectorAll('.cell'));
		let squareDigits = Array.from(grid.square(squareIndex));

		for (let i = 0; i < cells.length; ++i) {
			let digit = squareDigits[i];
			if (digit == 0)
				cells[i].classList.add('guess');
			else {
				cells[i].classList.add('puzzle');
				cells[i].appendChild(document.createTextNode(digit));
			}
		}
	}
}
