import initWasm, { Piece, PieceColor, PieceKind, MoveKind } from "./pkg/chess_core.js";

export function logWasm(wasm) {
	console.log('[wasm] has been initialized');

	console.debug('[wasm]', wasm.memory);

	console.debug('[wasm]', PieceColor);
	console.debug('[wasm]', PieceKind);
	console.debug('[wasm]', Piece);

	console.debug('[wasm]', Piece.new(PieceColor.White, PieceKind.Pawn).render_unicode());
	console.debug('[wasm]', Piece.new(PieceColor.Black, PieceKind.Rook).render_unicode());
}

export function logBoard(wasm, board) {
	for (let rank of [0, 1]) {
		for (let file of [0, 1, 2, 3, 4, 5, 6, 7]) {
			let cell = board.get_cell(rank, file);
			console.debug('[board]', `rank ${rank} file ${file}: ${cell == null ? ' ' : cell.render_unicode()}`);
		}
	}

	console.debug('[board] white checked:', board.is_checked(PieceColor.White));
	console.debug('[board] black checked:', board.is_checked(PieceColor.Black));
}

export function logState(state) {
	console.debug(`[state] castle abilities ${state.castle_abilities.render_text()}`);
	console.debug(`[state] white king side castle ability ${state.castle_abilities.white.king_side}`);
	console.debug(`[state] en passant file ${state.en_passant_file}`);
	console.debug(`[state] half moves ${state.half_moves}`);
	console.debug(`[state] full moves ${state.full_moves}`);
}

export function logPlayablePieces(game) {
	for (let playablePiece of game.playable_pieces()) {
		console.debug(
			'[play] can play piece at rank',
			playablePiece.position.rank,
			'file',
			playablePiece.position.file,
			'i.e.',
			playablePiece.position.render_text(),
			'with',
			playablePiece.moves().length,
			'moves'
		);
		for (let move of playablePiece.moves())
			console.debug('[play]', '\t->', move.target.render_text(), MoveKind[move.kind]);
	}
}

