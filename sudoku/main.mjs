import * as Grid from '/sudoku/grid.mjs';
import * as GridSession from '/sudoku/grid-session.mjs';

main();

function main() {
	let session = new GridSession.GridSession();
	let grid = sessionGetGrid(session);

	let board = document.getElementById('board');
	let clock = document.getElementById('clock');

	populateBoard(board);
	refreshCells(board, grid);
	startClockInterval(session, clock);
}

function sessionGetGrid(session) {
	if (session.cells() != null)
		return new Grid.Grid(session.cells());
	else {
		let randomGrid = Grid.Grid.randomWithDifficulty(Grid.Difficulty.EASY);
		session.setElapsedSeconds(0);
		session.setCells(randomGrid.cells());
		session.save();
		return randomGrid;
	}
}

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

function refreshCells(board, grid) {
	let squares = Array.from(board.querySelectorAll('.square'));
	for (let [squareIndex, square] of Object.entries(squares)) {
		squareIndex = parseInt(squareIndex);
		let cells = Array.from(square.querySelectorAll('.cell'));
		let squareCells = Array.from(grid.square(squareIndex));

		for (let i = 0; i < cells.length; ++i) {
			let digit = squareCells[i].digit;
			if (digit == 0)
				cells[i].classList.add('guess');
			else {
				cells[i].classList.add('puzzle');
				cells[i].appendChild(document.createTextNode(digit));
			}
		}
	}
}

function startClockInterval(session, clock) {
	onClockIntervalFire._startElapsedSeconds = session.elapsedSeconds();
	onClockIntervalFire._startTimestamp = window.performance.now();
	onClockIntervalFire._clock = clock;
	onClockIntervalFire._session = session;
	refreshClockLabel(clock, session.elapsedSeconds());
	setInterval(onClockIntervalFire, 1_000);
}

function onClockIntervalFire() {
	let elapsedMillis = window.performance.now() - onClockIntervalFire._startTimestamp;
	let newElapsedSeconds = onClockIntervalFire._startElapsedSeconds + elapsedMillis / 1_000.0;
	onClockIntervalFire._session.setElapsedSeconds(newElapsedSeconds);
	refreshClockLabel(clock, onClockIntervalFire._session.elapsedSeconds());

	onClockIntervalFire._session.saveElapsedSeconds();
}

function refreshClockLabel(clock, elapsedSeconds) {
	elapsedSeconds = parseInt(elapsedSeconds);
	let seconds = elapsedSeconds % 60;
	let minutes = parseInt(elapsedSeconds / 60);
	let hours = parseInt(elapsedSeconds / 3600);
	clock.textContent = formatClockLabelTimeComponents(hours, minutes, seconds);
}

function formatClockLabelTimeComponents(hours, minutes, seconds) {
	const padTimeComponent = (component) => component.toString().padStart(2, '0');
	let components = [];
	if (hours > 0)
		components.push(hours);
	if (hours > 0 || minutes > 0)
		components.push(minutes);
	components.push(seconds);
	return components.map(padTimeComponent).join(':');
}
