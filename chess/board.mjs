export function populate() {
	populateCells();
	populatePromotion();
}

export function populateCells() {
	for (let i = 0; i < N_CELLS; ++i) {
		let cellElement = document.createElement('p');
		cellElement.addEventListener('click', onCellClick);
		cellElements.push(cellElement);
		boardElement.appendChild(cellElement);
	}
}

export function populatePromotion() {
	let promotionContainer = document.createElement('div');
	promotionContainer.className = 'promotion-container';
	promotionSelection = document.createElement('div');
	promotionSelection.className = 'promotion-selection';
	promotionSelection.classList.add('white');
	promotionSelection.classList.add('file-a');
	for (let kind of ['queen', 'rook', 'bishop', 'knight']) {
		let promotionKindElement = document.createElement('p');
		promotionKindElement.classList.add('promotion-kind');
		promotionKindElement.classList.add(kind);
		promotionKindElement.addEventListener('click', onPromotionClick);
		promotionSelection.appendChild(promotionKindElement);
	}
	promotionContainer.appendChild(promotionSelection);
	promotionContainer.addEventListener('click', onPromotionClick);
	boardElement.appendChild(promotionContainer);
}

export function refresh(board) {
	for (let i = 0; i < N_CELLS; ++i) {
		let position = convertIndexToPosition(i);
		let cell = board.get_cell(position.rank, position.file);
		if (cell == null)
			cellElements[i].textContent = '\u00A0';
		else
			cellElements[i].textContent = cell.render_unicode();
	}
}

export function getBoardElement() {
	return boardElement;
}

export function getPromotionSelectionElement() {
	return promotionSelection;
}

export function setWhiteReversed(reversed) {
	if (reversed)
		boardElement.classList.add('reverse');
	else
		boardElement.classList.remove('reverse');
}

export function getCellElement(position) {
	return getCellElementAt(convertPositionToIndex(position));

}

export function getCellElementAt(index) {
	return new CellElement(cellElements[index]);
}

export function clearTargets() {
	for (let cell of cellElements)
		cell.classList.remove('target');
};

export function showPromotion(isWhite, file) {
	boardElement.classList.add('promoting');
	if (isWhite) {
		promotionSelection.classList.add('white');
		promotionSelection.classList.remove('black');
	} else {
		promotionSelection.classList.remove('white');
		promotionSelection.classList.add('black');
	}
	for (let i = 0; i < 8; ++i)
		promotionSelection.classList.remove(getFileClassName(i));
	promotionSelection.classList.add(getFileClassName(file));
}

export function hidePromotion() {
	boardElement.classList.remove('promoting');
}

function getFileClassName(file) {
	let fileLetter = String.fromCharCode('a'.charCodeAt(0) + file);
	return `file-${fileLetter}`;
}

class CellElement {
	constructor(cellElement) {
		this._cellElement = cellElement;
	}

	markTarget() {
		this._cellElement.classList.add('target');
	}

	unmarkTarget() {
		this._cellElement.classList.remove('target');
	}
}

function onCellClick(event) {
	let cell = event.target.closest('p');
	let cellIndex = cellElements.indexOf(cell);
	let cellPosition = convertIndexToPosition(cellIndex);

	let customEvent = new CustomEvent('cell-click', {
		detail: {
			cellIndex,
			cellPosition,
		}
	});
	boardElement.dispatchEvent(customEvent);
}

function onPromotionClick(event) {
	let element = event.target.closest('.promotion-selection .promotion-kind');
	if (element == null) {
		hidePromotion();
		return;
	}
	event.stopPropagation();
	let promotionKind = ['queen', 'rook', 'knight', 'bishop'].find(kind => element.classList.contains(kind));
	let customEvent = new CustomEvent('promotion-kind-click', {
		detail: {
			promotionKind
		}
	});
	promotionSelection.dispatchEvent(customEvent);
}

const convertIndexToPosition = (index) => {
	let rank = N_RANKS - parseInt(index / N_FILES) - 1;
	let file = index % N_FILES;
	return { rank, file };
};

const convertPositionToIndex = (position) => {
	return (N_RANKS - position.rank - 1) * N_FILES + position.file;
};

const N_CELLS = 64;
const N_FILES = 8;
const N_RANKS = 8;

let boardElement = document.getElementById('board');
let cellElements = [];
let promotionSelection = null;

