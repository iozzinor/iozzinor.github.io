import initWasm, { Position, Game, MoveKind, PieceColor } from "./pkg/chess_core.js";
import * as Debug from './debug.mjs';
import * as Board from './board.mjs';
import * as State from './state.mjs';
import * as Status from './status.mjs';
import { GameController } from './game-controller.mjs';

initWasm().then(onWasmInit)

function onWasmInit(wasm) {
	Debug.logWasm(wasm);

	let gameController = setupGameController(wasm);
	setupFenImport(gameController);
	document.getElementById('swap-white').addEventListener('input', event => {
		Board.setWhiteReversed(event.target.checked);
	});
}

function setupGameController(wasm) {
	let gameController = new GameController(Game.new());
	let cacheMove = {};

	Debug.logBoard(wasm, gameController.board());
	Debug.logState(gameController.state());
	Debug.logPlayablePieces(gameController.game());

	Board.populate();
	gameController_refresh(gameController);

	Board.getBoardElement().addEventListener('cell-click', onBoardElementCellClick.bind(null, gameController, cacheMove));
	Board.getPromotionSelectionElement().addEventListener('promotion-kind-click', onPromotionKindClick.bind(null, gameController, cacheMove));

	return gameController;
}

function onBoardElementCellClick(gameController, cacheMove, event) {
	gameController.onCellClicked(
		event.detail.cellPosition,
		(allowedMoves) => {
			Board.clearTargets();
			for (let allowedMove of allowedMoves)
				Board.getCellElement(allowedMove.target).markTarget();
		},
		(position, pieceMoveToPlay) => {
			Board.clearTargets();
			if (pieceMoveToPlay != null) {
				gameController.playPieceMove(position, pieceMoveToPlay);
				gameController_refresh(gameController);
			}
		},
		(position, pieceMoveToPlay) => {
			cacheMove.position = position;
			cacheMove.pieceMoveToPlay = pieceMoveToPlay;
			Board.clearTargets();
			Board.showPromotion(gameController.state().current_player == PieceColor.White , pieceMoveToPlay.target.file);
		}
	);
}

function onPromotionKindClick(gameController, cacheMove, event) {
	cacheMove.pieceMoveToPlay.kind = {
		'queen': MoveKind.PromoteQueen,
		'rook': MoveKind.PromoteRook,
		'knight': MoveKind.PromoteKnight,
		'bishop': MoveKind.PromoteBishop,
	}[event.detail.promotionKind];

	Board.hidePromotion();
	gameController.playPieceMove(cacheMove.position, cacheMove.pieceMoveToPlay);
	gameController_refresh(gameController);
}

function setupFenImport(gameController) {
	document.getElementById('fen-import').addEventListener('click', event => {
		let fenText = prompt('Please provided the FEN position.');
		if (fenText != null) {
			let game = Game.try_from_fen(fenText);
			if (game == null) {
				console.error('[game] invalid FEN');
				return;
			}
			gameController.setGame(game);
			gameController_refresh(gameController);
			Board.clearTargets();
		}
	});
}

function gameController_refresh(gameController) {
	const state = gameController.state();
	Board.refresh(gameController.board());
	State.refresh(state);
	Status.refresh(gameController.end_status(), state.current_player);
}
