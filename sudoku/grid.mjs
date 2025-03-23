import * as GridGenerator from '/sudoku/grid-generator.mjs';
import * as GridSolver from '/sudoku/grid-solver.mjs';
export { Difficulty } from '/sudoku/grid-generator.mjs';

export class CellCoordinates {
	#i;

	static fromSquare(squareIndex, innerSquareIndex) {
		let squareX = squareIndex % 3;
		let squareY = parseInt(squareIndex / 3);
		let innerSquareX = innerSquareIndex % 3;
		let innerSquareY = parseInt(innerSquareIndex / 3);
		let x = squareX * 3 + innerSquareX;
		let y = squareY * 3 + innerSquareY;
		return new this(x + y * 9);
	}

	constructor(i) {
		console.assert(i > -1 && i < 81);
		this.#i = i;
	}

	flatIndex()         { return this.#i; }
	x()                 { return this.#i % 9; }
	y()                 { return parseInt(this.#i / 9); }
	squareX()           { return parseInt(this.x() / 3); }
	squareY()           { return parseInt(this.y() / 3); }
	squareIndex()       { return this.squareX() + this.squareY() * 3; };
	innerSquareX()      { return this.x() % 3; }
	innerSquareY()      { return this.y() % 3; }
	innerSquareIndex()  { return this.innerSquareX() + this.innerSquareY() * 3; };
}

export class Grid {
	#cells;

	static randomWithDifficulty(difficulty) {
		let randomDigits = GridGenerator.generateRandomDigits(difficulty);
		let cells = randomDigits.map(digit => {
			if ((digit & 0x0F) == 0)
				return {
					digit: 0,
					isPuzzle: false,
					solution: digit >> 4,
					hintsMask: 0,
				};
			else
				return {
					digit,
					isPuzzle: true,
				};
		});
		return new this(cells);
	}

	constructor(cells) {
		this.#cells = cells;
	}

	text() {
		let result = '';
		for (let y = 0; y < 9; ++y) {
			if (y > 0)
				result += '\n';
			for (let x = 0; x < 9; ++x)
				result += this.#cells[y * 9 + x].toString();
		}
		return result;
	}

	cellAtIndex(i) {
		return this.#cells[i];
	}

	cellAt(x, y) {
		return this.#cells[x + y * 9];
	}

	cells() {
		return this.#cells;
	}

	setCells(cells) {
		console.assert(cells.length == 81);
		this.#cells = Array.from(cells);
	}

	setCellAtIndex(i, digit) {
		this.#cells[i] = digit;
	}

	setCellAt(x, y, digit) {
		this.#cells[x + y * 9] = digit;
	}

	square(squareIndex) {
		if (squareIndex < 0 || squareIndex > 8)
			throw new Error(`out of range square index ${squareIndex}`);
		return GridSolver.iterateSquares(this.#cells, squareIndex);
	}

	row(rowIndex) {
		if (rowIndex < 0 || rowIndex > 8)
			throw new Error(`out of range row index ${rowIndex}`);
		return GridSolver.iterateRows(this.#cells, rowIndex);
	}

	column(columnIndex) {
		if (columnIndex < 0 || columnIndex > 8)
			throw new Error(`out of range column index ${columnIndex}`);
		return GridSolver.iterateColumns(this.#cells, columnIndex);
	}

	isPartialSolution() {
		return gridIsPartialSolution(this.#cells);
	}

	isCompleteSolution() {
		return gridIsCompleteSolution(this.#cells);
	}
}

function gridIsPartialSolution(cells) {
	return GridSolver.gridAllComponentsAreSolution(cells, GridSolver.digitsArePartialSolution);
}

function gridIsCompleteSolution(cells) {
	return GridSolver.gridAllComponentsAreSolution(cells, GridSolver.digitsAreCompleteSolution);
}
