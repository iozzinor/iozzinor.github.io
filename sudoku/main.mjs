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
	if (checkWin(grid))
		onGameWon(session, clock);
	else
		startClockInterval(session, clock);
	setupPlayPanel(board, session, grid, clock);
	setupNewGrid(board, session, grid, clock);
}

function sessionGetGrid(session) {
	if (session.cells() != null)
		return new Grid.Grid(session.cells());
	else
		return sessionGenerateRandomGrid(session, Grid.Difficulty.EASY);
}

function sessionGenerateRandomGrid(session, difficulty) {
	let randomGrid = Grid.Grid.randomWithDifficulty(difficulty);
	session.setElapsedSeconds(0);
	session.setCells(randomGrid.cells());
	session.save();
	return randomGrid;
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
		let cell = document.createElement('div');
		cell.className = 'cell';
		cell.addEventListener('click', onCellClickedEventListener);
		cell.appendChild(populateBoard_createHints());

		let coordinates = Grid.CellCoordinates.fromSquare(squareIndex, i);
		cell.dataset.flatIndex = coordinates.flatIndex();

		square.appendChild(cell)
	}
	return square;
}

function populateBoard_createHints() {
	let hints = document.createElement('div');
	hints.className = 'hints';
	for (let d = 1; d < 10; ++d) {
		let paragraph = document.createElement('p');
		paragraph.appendChild(document.createTextNode(d));
		paragraph.dataset.bitIndex = d - 1;
		hints.appendChild(paragraph);
	}
	return hints;
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
			for (let classItem of ['guess', 'puzzle'])
				cells[i].classList.remove(classItem);

			let cell = squareCells[i];
			let digit = cell.digit;
			let isPuzzle = cell.isPuzzle;
			let hintsMask = cell.hintsMask;
			if (digit == 0 || !isPuzzle) {
				cells[i].classList.add('guess');
				cells[i].dataset.digit = (digit == 0 ? '' : digit);
				for (let bitIndex = 0; bitIndex < 9; ++bitIndex) {
					let hasHint = ((hintsMask >> bitIndex) & 1) == 1;
					let p = cells[i].querySelector(`.hints p[data-bit-index="${bitIndex}"]`);
					if (hasHint)    p.classList.add('selected');
					else            p.classList.remove('selected');
				}
			} else {
				cells[i].classList.add('puzzle');
				cells[i].dataset.digit = (digit == 0 ? '' : digit);
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
	onClockIntervalFire._intervalId = setInterval(onClockIntervalFire, 1_000);
}

function stopClockInterval() {
	if (onClockIntervalFire._intervalId === undefined)
		return;
	clearInterval(onClockIntervalFire._intervalId);
	delete onClockIntervalFire._intervalId;
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
	let label = formatClockLabelElapsedSeconds(elapsedSeconds);
	clock.textContent = label;
}

function formatClockLabelElapsedSeconds(elapsedSeconds) {
	let seconds = elapsedSeconds % 60;
	let minutes = parseInt(elapsedSeconds / 60) % 60;
	let hours = parseInt(elapsedSeconds / 3600);
	return formatClockLabelTimeComponents(hours, minutes, seconds);
}

function formatClockLabelTimeComponents(hours, minutes, seconds) {
	const padTimeComponent = (component) => component.toString().padStart(2, '0');
	let components = [];
	if (hours > 0)
		components.push(hours);
	components.push(minutes);
	components.push(seconds);
	return components.map(padTimeComponent).join(':');
}

function setupPlayPanel(board, session, grid, clock) {
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
				clock,
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

function onGuessCheckboxClicked(session, board, grid, container, selectedCellIndex, chosenDigit, clock) {
	console.assert(selectedCellIndex != null);

	let cell = grid.cellAtIndex(selectedCellIndex);
	let newDigit = (cell.digit == chosenDigit ? 0 : chosenDigit);
	cell.digit = newDigit;
	session.setCells(grid.cells());
	session.saveCells();
	let cellElement = board.querySelector(`.cell[data-flat-index="${selectedCellIndex}"]`);
	cellElement.dataset.digit = (newDigit == 0 ? '' : newDigit);
	for (let guessCheckbox of container.querySelectorAll('input[type=checkbox]'))
		guessCheckbox.checked = newDigit == guessCheckbox.dataset.digit;

	if (checkWin(grid))
		onGameWon(session, clock);
	else
		onGamePending(session, clock);
}

function checkWin(grid) {
	let won = grid.cells().every(cell => cell.isPuzzle || cell.solution == cell.digit);
	return won;
}

function onGameWon(session, clock) {
	stopClockInterval();
	let formattedTime = formatClockLabelElapsedSeconds(parseInt(session.elapsedSeconds()));
	clock.textContent = `You won in ${formattedTime}!`;
}

function onGamePending(session, clock) {
	let clockIntervalNotFiring = (onClockIntervalFire._intervalId === undefined);
	if (clockIntervalNotFiring)
		startClockInterval(session, clock);
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
	let cellElement = board.querySelector(`.cell[data-flat-index="${selectedCellIndex}"]`);
	let p = cellElement.querySelector(`.hints p[data-bit-index="${bitIndex}"`);
	if (isChecked)  p.classList.add('selected');
	else            p.classList.remove('selected');
}

function setupNewGrid(board, session, grid, clock) {
	const newGridDialog = document.getElementById('new-grid-dialog');
	const difficulties = {
		easy: Grid.Difficulty.EASY,
		medium: Grid.Difficulty.MEDIUM,
		hard: Grid.Difficulty.HARD,
	};
	document.getElementById('new-grid').addEventListener('click', () => {
		newGridDialog.returnValue = '';
		newGridDialog.showModal();
	});


	newGridDialog.addEventListener('close', event => {
		let difficulty = difficulties[document.getElementById('difficulty').value];

		if (newGridDialog.returnValue == 'ok')
			onNewGridConfirm(board, session, grid, clock, difficulty);
	});
}

function onNewGridConfirm(board, session, grid, clock, difficulty) {
	let newGrid = sessionGenerateRandomGrid(session, difficulty);
	stopClockInterval();
	startClockInterval(session, clock);

	grid.setCells(newGrid.cells());
	refreshCells(board, grid);
	selectedCellIndex = null;
	let customEvent = new CustomEvent('cell-selection-change', {
		detail: { selectedCellIndex }
	});
	board.dispatchEvent(customEvent);
	let previous = board.querySelector('.cell.selected');
	if (previous != null)
		previous.classList.remove('selected');
}
