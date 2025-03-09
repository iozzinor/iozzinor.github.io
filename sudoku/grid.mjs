import * as GridSolver from '/sudoku/grid-solver.mjs';

export class Grid {
	#digits;

	constructor() {
		this.#digits = Grid_generateRandomDigits();
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

function Grid_generateRandomDigits() {
	//const fullGridDigits = Array.from('021864079749001826806729041460287190072916408918040762280670914604198207197402680').map(c => parseInt(c));
	//const fullGridDigits = Array.from('000000000000003085001020000000507000004000100090000000500000073002010000000040009').map(c => parseInt(c));
	let fullGridDigits = gridGenerateFullDigits();
	return gridRemoveDigits(fullGridDigits, 50);
}

function gridGenerateFullDigits() {
	return gridGenerateFullDigits_withMaxAttempts(1_000);
}

function gridGenerateFullDigits_withMaxAttempts(maxAttempts) {
	for (let i = 0; i < maxAttempts; ++i) {
		let grid = tryToGenerateGridWithFullDigits(maxAttempts)
		if (grid != null)
			return grid;
	}
	return null;
}

function tryToGenerateGridWithFullDigits(maxAttempts) {
	let grid = Array(81).fill(0);
	let digitsToAdd = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	shuffleArray(digitsToAdd);
	for (let digitToAdd of digitsToAdd)
		if (!tryToPopulateGridWithDigit(grid, digitToAdd, maxAttempts))
			return null;
	return grid;
}

function tryToPopulateGridWithDigit(grid, digitToAdd, maxAttempts) {
	const clearDigit = (grid, digitToClear) => {
		for (let i = 0; i < grid.length; ++i)
			if (grid[i] == digitToClear)
				grid[i] = 0;
	};

	const populateGridWithDigit = (grid, digitToAdd) => {
		const SQUARE_INDEXES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
		shuffleArray(SQUARE_INDEXES);
		for (let squareIndex of SQUARE_INDEXES) {
			let emptyIndexes = findEmptyIndexes(grid, squareIndex);
			shuffleArray(emptyIndexes);
			let didPlay = false;
			for (let i of emptyIndexes) {
				if (GridSolver.canPlayDigitAt(grid, i, digitToAdd)) {
					grid[i] = digitToAdd;
					didPlay = true;
					break;
				}
			}
			if (!didPlay)
				return false;
		}
		return true;
	};

	const findEmptyIndexes = (grid, squareIndex) => {
		return [0, 1, 2, 3, 4, 5, 6, 7, 8]
			.flatMap(innerIndex => {
				let x = innerIndex % 3 + (squareIndex % 3) * 3;
				let y = Math.floor(innerIndex / 3) + Math.floor(squareIndex / 3) * 3;
				if (grid[x + y * 9] == 0)
					return [x + y * 9]
				else
					return [];
			});
	};

	for (let _attempt = 0; _attempt < maxAttempts; ++_attempt) {
		clearDigit(grid, digitToAdd);
		if (populateGridWithDigit(grid, digitToAdd))
			return true;
	}
	return false;
}

function shuffleArray(array) {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		let swapIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		[array[currentIndex], array[swapIndex]] = [array[swapIndex], array[currentIndex]];
	}
}

function gridIsPartialSolution(digits) {
	return GridSolver.gridAllComponentsAreSolution(digits, GridSolver.digitsArePartialSolution);
}

function gridIsCompleteSolution(digits) {
	return GridSolver.gridAllComponentsAreSolution(digits, GridSolver.digitsAreCompleteSolution);
}

function gridRemoveDigits(fullDigits, numberOfDigitsToRemove) {
	return tryToRemoveDigits(fullDigits, numberOfDigitsToRemove, 1_000);
}

function tryToRemoveDigits(fullDigits, numberOfDigitsToRemove, maxAttempts) {
	const getIndexesToRemove = (total, n) => {
		let indexes = [];
		for (let i = 0; i < total; ++i)
			indexes.push(i);
		shuffleArray(indexes);
		return Array.from(indexes.slice(0, n));
	};
	const hasUniqueSolution = (digits) => {
		return GridSolver.solve(digits).length == 1;
	};

	for (let _attempt = 0; _attempt < maxAttempts; ++_attempt) {
		let digits = Array.from(fullDigits);
		let indexesToRemove = getIndexesToRemove(digits.length, numberOfDigitsToRemove);

		let didRemoveAllDigits = true;
		for (let i of indexesToRemove) {
			digits[i] = 0;
			if (!hasUniqueSolution(digits)) {
				didRemoveAllDigits = false;
				break;
			}
		}
		if (didRemoveAllDigits)
			return digits;
	}
}
