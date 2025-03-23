import * as DancingLinks from '/sudoku/dancing-links.mjs';

export function solve(digits) {
	let exactCoverMatrixRows = gridDigitsToExactCoverMatrixRows(digits);

	let booleanGrid = exactCoverMatrixRows.map(row => row.bools);
	let solutions = DancingLinks.solve(booleanGrid);
	return solutions.map(solutionRowIndexes => extractSolutionFromMatrixRows(digits, exactCoverMatrixRows, solutionRowIndexes));
}

function gridDigitsToExactCoverMatrixRows(digits) {
	function generateECMRow(i, digit) {
		const rowIndex = (i) => {
			return Math.floor(i / 9);
		};
		const columnIndex = (i) => {
			return i % 9;
		};
		const squareIndex = (i) => {
			let x = columnIndex(i);
			let y = rowIndex(i);
			let squareX = Math.floor(x / 3);
			let squareY = Math.floor(y / 3);
			return squareX + squareY * 3;
		};
		let result = Array(9 * 9 * 4).fill(false);
		// position
		result[i] = true;
		// row
		result[81 + rowIndex(i) * 9 + digit - 1] = true;
		// column
		result[162 + columnIndex(i) * 9 + digit - 1] = true;
		// square
		result[243 + squareIndex(i) * 9 + digit - 1] = true;
		return {
			tag: { cellIndex: i, digit },
			bools: result,
		};
	}

	let rows = [];
	for (var [i, digit] of Object.entries(digits)) {
		i = parseInt(i);
		if (digits[i] == 0) {
			for (let d of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
				digits[i] = d;
				if (gridAllComponentsAreSolution(digits, digitsArePartialSolution))
					rows.push(generateECMRow(i, d));
			}
			digits[i] = 0;
		} else
			rows.push(generateECMRow(i, digits[i]));
	}
	return rows;
}

function extractSolutionFromMatrixRows(puzzleDigits, allMatrixRows, solutionRowIndexes) {
	let digits = Array(81);
	for (let index of solutionRowIndexes) {
		let matrixRow = allMatrixRows[index];
		let cellIndex = matrixRow.tag.cellIndex;
		digits[cellIndex] = {
			puzzleState: (puzzleDigits[cellIndex] == 0 ? 'solution' : 'given'),
			digit: matrixRow.tag.digit,
		};
	}
	return digits;
}

export function gridAllComponentsAreSolution(digits, componentChecker) {
	for (let i = 0; i < 9; ++i) {
		if (!componentChecker(iterateSquares(digits, i)))
			return false;
		if (!componentChecker(iterateRows(digits, i)))
			return false;
		if (!componentChecker(iterateColumns(digits, i)))
			return false;
	}
	return true;
}

export function digitsArePartialSolution(digits) {
	let counts = getDigitsCounts(digits);
	return counts.slice(1).every(count => count < 2);
}

export function digitsAreCompleteSolution(digits) {
	let counts = getDigitsCounts(digits);
	return counts[0] == 0 && counts.slice(1).every(count => count == 1);
}

function getDigitsCounts(digits) {
	let counts = Array(10).fill(0);
	for (let digit of digits)
		counts[digit] += 1;
	return counts;
}

export function *iterateSquares(digits, squareIndex) {
	let squareX = squareIndex % 3;
	let squareY = Math.floor(squareIndex / 3);
	for (let innerY = 0; innerY < 3; ++innerY) {
		let y = squareY * 3 + innerY;
		for (let innerX = 0; innerX < 3; ++innerX) {
			let x = squareX * 3 + innerX;
			yield digits[x + y * 9];
		}
	}
}

export function *iterateRows(digits, rowIndex) {
	for (let x = 0; x < 9; ++x)
		yield digits[x + rowIndex * 9];
}

export function *iterateColumns(digits, columnIndex) {
	for (let y = 0; y < 9; ++y)
		yield digits[columnIndex + y * 9];
}

export function canPlayDigitAt(digits, i, digit) {
	const digitIsNotIn = (iterable, digit) => {
		for (let d of iterable)
			if (d == digit)
				return false;
		return true;
	};

	let row = Math.floor(i / 9);
	let column = i % 9;
	let square = Math.floor(column / 3) + Math.floor(row / 3) * 3;
	return digitIsNotIn(iterateRows(digits, row), digit)
		&& digitIsNotIn(iterateColumns(digits, column), digit)
		&& digitIsNotIn(iterateSquares(digits, square), digit);
};

