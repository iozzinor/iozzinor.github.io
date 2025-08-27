import { PieceColor } from './pkg/chess_core.js';

export function refresh(state) {
	ELEMENTS.currentPlayer.textContent = (state.current_player == PieceColor.White ? 'white' : 'black');
	ELEMENTS.castleAbilities.textContent = state.castle_abilities.render_text();
	ELEMENTS.enPassantFile.textContent = (state.en_passant_file == null ? '-' : state.en_passant_file);
	ELEMENTS.halfMoves.textContent = state.half_moves;
	ELEMENTS.fullMoves.textContent = state.full_moves;
	ELEMENTS.fen.textContent = state.render_fen();
}

const ELEMENTS = {
	currentPlayer: document.getElementById('game-state_current-player'),
	castleAbilities: document.getElementById('game-state_castle-abilities'),
	enPassantFile: document.getElementById('game-state_en-passant-file'),
	halfMoves: document.getElementById('game-state_half-moves'),
	fullMoves: document.getElementById('game-state_full-moves'),
	fen: document.getElementById('game-state_fen'),
}
