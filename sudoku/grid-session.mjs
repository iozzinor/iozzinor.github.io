export class GridSession {
	#store;
	#elapsedSeconds;
	#cells;

	constructor() {
		this.#store = window.sessionStorage;
		this.#elapsedSeconds = retrieveElapsedSeconds(this.#store);
		this.#cells = retrieveCells(this.#store);
	}

	elapsedSeconds() {
		return this.#elapsedSeconds;
	}

	setElapsedSeconds(elapsedSeconds) {
		this.#elapsedSeconds = elapsedSeconds;
	}

	cells() {
		return this.#cells;
	}

	setCells(cells) {
		this.#cells = cells;
	}

	save() {
		storeElapsedSeconds(this.#store, this.#elapsedSeconds);
		storeCells(this.#store, this.#cells);
	}
}

const KEY_ELAPSED_SECONDS = 'SUDOKU_ELAPSED_SECONDS';
const KEY_CELLS = 'SUDOKU_CELLS';

function retrieveElapsedSeconds(store) {
	let elapsedSeconds = store.getItem(KEY_ELAPSED_SECONDS);
	if (elapsedSeconds != null)
		elapsedSeconds = parseFloat(elapsedSeconds);
	return elapsedSeconds;
}

function retrieveCells(store) {
	let cellIntegersBase64 = store.getItem(KEY_CELLS);
	if (cellIntegersBase64 == null)
		return null;
	let cellBytes = Uint8Array.fromBase64(cellIntegersBase64);
	let cellIntegers = new Uint16Array(cellBytes.buffer);

	console.assert(cellBytes.length == 162);
	console.assert(cellIntegers.length == 81);
	let cells = Array.from(cellIntegers).map(cellIntegerToCell);
	return cells;
}

function cellIntegerToCell(cellInteger) {
	if (((cellInteger & 0b1110000) >> 4) == 0b111) {
		let puzzleDigit = cellInteger & 0b1111;
		return {
			digit: puzzleDigit,
			isPuzzle: true,
		};
	} else {
		let hintsMask = cellInteger >> 7;
		let low = cellInteger & 0b1111111;
		let playedDigit = parseInt(low / 10);
		let solution = (low % 10) + 1;
		return {
			digit: playedDigit,
			isPuzzle: false,
			solution,
			hintsMask,
		};
	}
}

function storeElapsedSeconds(store, elapsedSeconds) {
	store.setItem(KEY_ELAPSED_SECONDS, elapsedSeconds.toString());
}

function storeCells(store, cells) {
	let cellIntegers = cellsToCellIntegers(cells);
	let buffer = new ArrayBuffer(162);
	let view = new Uint16Array(buffer);
	for (const [i, cellInteger] of Object.entries(cellIntegers))
		view[i] = cellInteger;
	let cellsBase64 = (new Uint8Array(buffer)).toBase64();
	store.setItem(KEY_CELLS, cellsBase64);
}

function cellsToCellIntegers(cells) {
	return cells.map(cellToCellInteger);
}

function cellToCellInteger(cell) {
	if (cell.isPuzzle) {
		console.assert(cell.digit > 0 && cell.digit < 10);
		return 0b1110000 | cell.digit;
	} else {
		console.assert(cell.digit > -1 && cell.digit < 10);
		console.assert(cell.solution > 0 && cell.solution < 10);
		let integer = cell.digit * 10 + (cell.solution - 1);
		return  (cell.hintsMask << 7) | integer;
	}
}
