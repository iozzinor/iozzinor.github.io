import * as Grid from '/sudoku/grid.mjs';
import * as GridSession from '/sudoku/grid-session.mjs';

let selectedCellIndex = null;
main();

function main() {
	let session = new GridSession.GridSession();
	let grid = sessionGetGrid(session);

	let board = document.getElementById('board');
	let clock = document.getElementById('clock');

	populateBoard(board);
	refreshCells(board, grid);
	startClockInterval(session, clock);
	setupPlayPanel(board, session, grid);
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
	const onCellClickedEventListener = onCellClicked.bind(null, board);
	for (let i = 0; i < 9; ++i) {
		let square = populateBoard_createSquare(i, onCellClickedEventListener);
		board.appendChild(square);
	}
}

function populateBoard_createSquare(squareIndex, onCellClickedEventListener) {
	let square = document.createElement('div');
	square.className = 'square';
	for (let i = 0; i < 9; ++i) {
		let cell = document.createElement('p');
		cell.className = 'cell';
		cell.addEventListener('click', onCellClickedEventListener);

		let coordinates = Grid.CellCoordinates.fromSquare(squareIndex, i);
		cell.dataset.flatIndex = coordinates.flatIndex();

		square.appendChild(cell)
	}
	return square;
}

function onCellClicked(board, event) {
	let cell = event.target.closest('.cell');
	let clickedCellIndex = parseInt(cell.dataset.flatIndex);
	selectedCellIndex = (selectedCellIndex == clickedCellIndex ? null : clickedCellIndex);
	let customEvent = new CustomEvent('cell-selection-change', {
		detail: { selectedCellIndex }
	});
	board.dispatchEvent(customEvent);

	// unselected previous cell
	let previous = board.querySelector('.cell.selected');
	if (previous != null)
		previous.classList.remove('selected');
	// select new cell
	if (selectedCellIndex != null)
		cell.classList.add('selected');
}

function refreshCells(board, grid) {
	let squares = Array.from(board.querySelectorAll('.square'));
	for (let [squareIndex, square] of Object.entries(squares)) {
		squareIndex = parseInt(squareIndex);
		let cells = Array.from(square.querySelectorAll('.cell'));
		let squareCells = Array.from(grid.square(squareIndex));

		for (let i = 0; i < cells.length; ++i) {
			let digit = squareCells[i].digit;
			let isPuzzle = squareCells[i].isPuzzle;
			if (digit == 0 || !isPuzzle)
				cells[i].classList.add('guess');
			else
				cells[i].classList.add('puzzle');
			if (digit > 0)
				cells[i].appendChild(document.createTextNode(digit));
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
	let minutes = parseInt(elapsedSeconds / 60) % 60;
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

function setupPlayPanel(board, session, grid) {
	const selectMode = (newMode) => {
		let cell = (selectedCellIndex == null ? null : grid.cellAtIndex(selectedCellIndex));
		let aPlayableCellIsSelected = (selectedCellIndex != null && !cell.isPuzzle);
		for (const [mode, container] of Object.entries(playModePanels))
			if (aPlayableCellIsSelected && mode == newMode) {
				container.classList.remove('hidden');
				playModeRestore[mode](container, cell);
			}
			else
				container.classList.add('hidden');
		if (aPlayableCellIsSelected)
			noSelectedCellsLabel.classList.add('hidden');
		else
			noSelectedCellsLabel.classList.remove('hidden');
	};
	const refreshPanelForCurrentMode = () => {
		selectMode(document.querySelector('input[type=radio][name=play-mode]:checked').value);
	};
	const playModeRestore_guess = (container, cell) => {
		for (let checkbox of container.querySelectorAll('input[type=checkbox]'))
			checkbox.checked = cell.digit == checkbox.dataset.digit;
	};
	const playModeRestore_hint = (container, cell) => {
		for (let checkbox of container.querySelectorAll('input[type=checkbox]')) {
			let bitIndex = parseInt(checkbox.dataset.digit) - 1;
			let bit = (cell.hintsMask >> bitIndex) & 1;
			checkbox.checked = (bit == 1);
		}
	};

	let playModePanels = {
		'guess': document.getElementById('play-guess-container'),
		'hint': document.getElementById('play-hint-container'),
	};
	let playModeRestore = {
		'guess': playModeRestore_guess,
		'hint': playModeRestore_hint,
	};
	let noSelectedCellsLabel = document.getElementById('play-no-selected-cells');
	let playModeInputs = document.querySelectorAll('input[type=radio][name=play-mode]');
	refreshPanelForCurrentMode();
	for (let playModeInput of playModeInputs) {
		playModeInput.addEventListener('change', event => {
			let newMode = event.target.value;
			selectMode(newMode);
		});
	}
	board.addEventListener('cell-selection-change', refreshPanelForCurrentMode);

	for (let guessCheckbox of playModePanels['guess'].querySelectorAll('input[type=checkbox]'))
		guessCheckbox.addEventListener('click', event => {
			onGuessCheckboxClicked(
				session,
				board,
				grid,
				playModePanels['guess'],
				selectedCellIndex,
				parseInt(event.target.dataset.digit),
			)
		});
	for (let hintCheckbox of playModePanels['hint'].querySelectorAll('input[type=checkbox]'))
		hintCheckbox.addEventListener('click', event => {
			onHintCheckboxClicked(
				session,
				board,
				grid,
				playModePanels['hint'],
				selectedCellIndex,
				parseInt(event.target.dataset.digit),
				event.target.checked,
			)
		});
}

function onGuessCheckboxClicked(session, board, grid, container, selectedCellIndex, chosenDigit) {
	console.assert(selectedCellIndex != null);

	let cell = grid.cellAtIndex(selectedCellIndex);
	let newDigit = (cell.digit == chosenDigit ? 0 : chosenDigit);
	cell.digit = newDigit;
	session.setCells(grid.cells());
	session.saveCells();
	board.querySelector(`.cell[data-flat-index="${selectedCellIndex}"]`).textContent = (newDigit == 0 ? '' : newDigit.toString());

	for (let guessCheckbox of container.querySelectorAll('input[type=checkbox]'))
		guessCheckbox.checked = newDigit == guessCheckbox.dataset.digit;
}

function onHintCheckboxClicked(session, board, grid, container, selectedCellIndex, chosenDigit, isChecked) {
	console.assert(selectedCellIndex != null);

	let cell = grid.cellAtIndex(selectedCellIndex);
	let bitIndex = chosenDigit - 1;
	if (isChecked)
		cell.hintsMask |= 1 << bitIndex;
	else
		cell.hintsMask &= 0b111111111 & ~(1 << bitIndex);
	session.setCells(grid.cells());
	session.saveCells();
}
