import * as GridSolver from '/sudoku/grid-solver.mjs';

export function generateRandomDigits(difficulty) {
	difficulty = (difficulty === undefined ? Difficulty.EASY : difficulty);
	let numberOfDigitsToRemove = Difficulty_getNumberOfDigitsToRemove(difficulty);

	let fullGridDigits = gridGenerateFullDigits();
	return gridRemoveDigits(fullGridDigits, numberOfDigitsToRemove);
}

export const Difficulty = {};
Object.defineProperty(Difficulty, 'EASY', { value: 0, writable: false, enumeratable: true });
Object.defineProperty(Difficulty, 'MEDIUM', { value: 1, writable: false, enumeratable: true });
Object.defineProperty(Difficulty, 'HARD', { value: 2, writable: false, enumeratable: true });
Object.freeze(Difficulty);

function Difficulty_getNumberOfDigitsToRemove(difficulty) {
	let lookup = {};
	lookup[Difficulty.EASY] = 30;
	lookup[Difficulty.MEDIUM] = 40;
	lookup[Difficulty.HARD] = 56;
	if (!(difficulty in lookup))
		throw new Error(`unsupported difficulty ${difficulty}`);
	return lookup[difficulty];
}

const DEFAULT_GENERATE_MAX_ATTEMPTS = 1_000;
const DEFAULT_REMOVE_MAX_ATTEMPTS = 200;

function gridGenerateFullDigits() {
	return gridGenerateFullDigits_withMaxAttempts(DEFAULT_GENERATE_MAX_ATTEMPTS);
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

function gridRemoveDigits(fullDigits, numberOfDigitsToRemove) {
	return tryToRemoveDigits(fullDigits, numberOfDigitsToRemove, DEFAULT_REMOVE_MAX_ATTEMPTS);
}

function tryToRemoveDigits(fullDigits, numberOfDigitsToRemove, maxAttemptsPerDigit) {
	let digits = tryToRemoveDigits_getDigits(fullDigits, numberOfDigitsToRemove, maxAttemptsPerDigit);
	for (let i = 0; i < digits.length; ++i)
		digits[i] = digits[i] > 0 ? digits[i] : (fullDigits[i] << 4);
	return digits;
}

function tryToRemoveDigits_getDigits(fullDigits, numberOfDigitsToRemove, maxAttemptsPerDigit) {
	const hasUniqueSolution = (digits) => {
		return GridSolver.solve(digits).length == 1;
	};

	let candidateIndexes = [];
	for (let i = 0; i < 81; ++i) candidateIndexes.push(i);
	let digits = Array.from(fullDigits);

	let digitIndex;
	for (digitIndex = 0; digitIndex < numberOfDigitsToRemove; ++digitIndex) {
		let didRemoveDigit = false;
		for (let _digitAttempt = 0; _digitAttempt < maxAttemptsPerDigit; _digitAttempt++) {
			let i = pickRandomIndex(candidateIndexes);
			let candidateIndex = candidateIndexes[i];
			let digitBackup = digits[candidateIndex];
			digits[candidateIndex] = 0;
			if (hasUniqueSolution(digits)) {
				candidateIndexes.splice(i, 1);
				didRemoveDigit = true;
				break;
			}
			digits[candidateIndex] = digitBackup;
		}
		if (!didRemoveDigit) {
			console.error(`could not generate grid within ${maxAttemptsPerDigit} for digit #${digitIndex + 1}`);
			return null;
		}
	}
	return digits;
}

function shuffleArray(array) {
	let currentIndex = array.length;
	while (currentIndex != 0) {
		let swapIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		[array[currentIndex], array[swapIndex]] = [array[swapIndex], array[currentIndex]];
	}
}

function pickRandomIndex(array) {
	return Math.floor(Math.random() * array.length);
}
