import * as GridGenerator from '/sudoku/grid-generator.mjs';
import * as GridSolver from '/sudoku/grid-solver.mjs';
export { Difficulty } from '/sudoku/grid-generator.mjs';

export class Grid {
	#digits;

	constructor(difficulty) {
		this.#digits = GridGenerator.generateRandomDigits(difficulty);
	}

	text() {
		let result = '';
		for (let y = 0; y < 9; ++y) {
			if (y > 0)
				result += '\n';
			for (let x = 0; x < 9; ++x)
				result += this.#digits[y * 9 + x];
		}
		return result;
	}

	cellAtIndex(i) {
		return this.#digits[i];
	}

	cellAt(x, y) {
		return this.#digits[x + y * 9];
	}

	setCellAtIndex(i, digit) {
		this.#digits[i] = digit;
	}

	setCellAt(x, y, digit) {
		this.#digits[x + y * 9] = digit;
	}

	square(squareIndex) {
		if (squareIndex < 0 || squareIndex > 8)
			throw new Error(`out of range square index ${squareIndex}`);
		return GridSolver.getSquareDigits(this.#digits, squareIndex);
	}

	row(rowIndex) {
		if (rowIndex < 0 || rowIndex > 8)
			throw new Error(`out of range row index ${rowIndex}`);
		return GridSolver.getRowDigits(this.#digits, rowIndex);
	}

	column(columnIndex) {
		if (columnIndex < 0 || columnIndex > 8)
			throw new Error(`out of range column index ${columnIndex}`);
		return GridSolver.getColumnDigits(this.#digits, columnIndex);
	}

	isPartialSolution() {
		return gridIsPartialSolution(this.#digits);
	}

	isCompleteSolution() {
		return gridIsCompleteSolution(this.#digits);
	}
}

function gridIsPartialSolution(digits) {
	return GridSolver.gridAllComponentsAreSolution(digits, GridSolver.digitsArePartialSolution);
}

function gridIsCompleteSolution(digits) {
	return GridSolver.gridAllComponentsAreSolution(digits, GridSolver.digitsAreCompleteSolution);
}

