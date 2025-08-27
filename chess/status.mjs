import { EndStatus, PieceColor } from './pkg/chess_core.js';

export function refresh(gameEndStatus, currentPlayer) {
	clearStatuses();
	if (gameEndStatus != null)
		ELEMENT.classList.add(STATUS_CLASS_NAMES[gameEndStatus]);
	else {
		ELEMENT.classList.add('pending');
		ELEMENT.classList.add(currentPlayer == PieceColor.White ? 'white' : 'black');
	}
}

function clearStatuses() {
	ELEMENT.classList.remove('pending');
	ELEMENT.classList.remove('white');
	ELEMENT.classList.remove('black');
	for (let className of Object.values(STATUS_CLASS_NAMES))
		ELEMENT.classList.remove(className);
}

const STATUS_CLASS_NAMES = {};
STATUS_CLASS_NAMES[EndStatus.DrawAgreement] = 'draw-agreement';
STATUS_CLASS_NAMES[EndStatus.DrawStalemate] = 'draw-stalemate';
STATUS_CLASS_NAMES[EndStatus.DrawThreeFold] = 'draw-three-fold';
STATUS_CLASS_NAMES[EndStatus.DrawFiftyMove] = 'draw-fifty-move';
STATUS_CLASS_NAMES[EndStatus.DrawMaterial] = 'draw-material';
STATUS_CLASS_NAMES[EndStatus.WhiteCheckmated] = 'white-checkmated';
STATUS_CLASS_NAMES[EndStatus.BlackCheckmated] = 'black-checkmated';
STATUS_CLASS_NAMES[EndStatus.WhiteResigned] = 'white-resigned';
STATUS_CLASS_NAMES[EndStatus.BlackResigned] = 'black-resigned';
STATUS_CLASS_NAMES[EndStatus.WhiteTimeout] = 'white-timeout';
STATUS_CLASS_NAMES[EndStatus.BlackTimeout] = 'black-timeout';

Object.freeze(STATUS_CLASS_NAMES);

const ELEMENT = document.getElementById('game-status');
