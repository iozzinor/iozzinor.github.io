import * as GridGenerator from '/sudoku/grid-generator.mjs';
import * as GridSolver from '/sudoku/grid-solver.mjs';
export { Difficulty } from '/sudoku/grid-generator.mjs';

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

