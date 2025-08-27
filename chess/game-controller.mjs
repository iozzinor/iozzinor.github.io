import { MoveKind } from './pkg/chess_core.js';

export class GameController {
	constructor(game) {
		this._game = game;
		this._state = this._game.state();
		this._board = this._state.board();
		this._playablePieces = this._game.playable_pieces();
		this._selectedPiecePosition = null;
	}

	game() { return this._game; }
	state() { return this._state; }
	board() { return this._board; }
	end_status() { return this._game.end_status(); }

	setGame(game) {
		this._game = game;
		this._state = this._game.state();
		this._board = this._state.board();
		this._playablePieces = this._game.playable_pieces();
	}

	onCellClicked(clickedCellPosition, onTargetMovesToDisplay, onPieceMoveToPlay, onShowPromotionRequired) {
		if (this._selectedPiecePosition == null)
			gameController_onCellClicked_noPreviousSelectionIdentifyTargetMoves(this, clickedCellPosition, onTargetMovesToDisplay);
		else
			gameController_onCellClicked_previousSelectionTryToPerformTargetMove(this, clickedCellPosition, onPieceMoveToPlay, onShowPromotionRequired);
	}

	playPieceMove(position, pieceMove) {
		try {
			this._game.play_piece_move(position, pieceMove)
		} catch (error) {
			console.error(error);
		}
		this._state = this._game.state();
		this._board = this._state.board();
		this._playablePieces = this._game.playable_pieces();
	}
}

function gameController_onCellClicked_noPreviousSelectionIdentifyTargetMoves(gameController, clickedCellPosition, onTargetMovesToDisplay) {
	let playablePiece = gameController._playablePieces.find(p => p.position.rank == clickedCellPosition.rank && p.position.file == clickedCellPosition.file);
	if (playablePiece != null) {
		gameController._selectedPiecePosition = clickedCellPosition;
		onTargetMovesToDisplay(playablePiece.moves());
	}
}

function gameController_onCellClicked_previousSelectionTryToPerformTargetMove(gameController, clickedCellPosition, onPieceMoveToPlay, onShowPromotionRequired) {
	let previousPlayablePiece = gameController._playablePieces.find(p => p.position.rank == gameController._selectedPiecePosition.rank && p.position.file == gameController._selectedPiecePosition.file);
	gameController._selectedPiecePosition = null;

	let pieceMoveToPlay = previousPlayablePiece.moves().find(move => move.target.rank == clickedCellPosition.rank && move.target.file == clickedCellPosition.file);
	if (pieceMoveToPlay != null && isMovePromotion(pieceMoveToPlay))
		onShowPromotionRequired(previousPlayablePiece.position, pieceMoveToPlay);
	else
		onPieceMoveToPlay(previousPlayablePiece.position, pieceMoveToPlay);
}

function isMovePromotion(move) {
	return [MoveKind.PromoteQueen, MoveKind.PromoteRook, MoveKind.PromoteBishop, MoveKind.PromoteKnight].includes(move.kind);
}

