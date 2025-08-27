import initWasm, { CastleAbilities, Position, Piece, PieceColor, PieceKind, State as WasmState } from "./pkg/chess_core.js";
import * as Debug from './debug.mjs';
import * as Board from './board.mjs';

initWasm().then(onWasmInit)

function onWasmInit(wasm) {
	Debug.logWasm(wasm);

	setupState(wasm);
	setupFenImport(state);
	setupSwapWhite();
	setupCopyFenToClipboard();
	setupStateListeners();
}

function setupState(wasm) {
	state = WasmState.empty();

	Debug.logBoard(wasm, state.board());
	Debug.logState(state);

	Board.populate();
	refreshBoardAndState();

	Board.getBoardElement().addEventListener('cell-click', onBoardElementCellClick);
}

function setupFenImport() {
	document.getElementById('fen-import').addEventListener('click', event => {
		let fenText = prompt('Please provided the FEN position.');
		if (fenText != null) {
			state = WasmState.try_from_fen(fenText);
			if (state == null) {
				console.error('[state] invalid FEN');
				return;
			}
			refreshBoardAndState();
		}
	});
}

function setupSwapWhite() {
	document.getElementById('swap-white').addEventListener('input', event => {
		Board.setWhiteReversed(event.target.checked);
	});
}

function setupCopyFenToClipboard() {
	document.getElementById('copy-fen-to-clipboard').addEventListener('click', onCopyFenToClipboard);
}

function setupStateListeners() {
	setupStateListeners_currentPlayer();
	setupStateListeners_castleAbilities();
	setupStateListeners_enPassantFile();
	setupStateListeners_halfMoves();
	setupStateListeners_fullMoves();
}

function setupStateListeners_currentPlayer() {
	for (let input of document.querySelectorAll('#game-state_current-player input[type=radio][name=game-state_current-player]')) {
		input.addEventListener('change', event => {
			const newPlayer = (event.target.value == 'white' ? PieceColor.White : PieceColor.Black);
			state.current_player = newPlayer;
			refreshState();
		})
	}
}

function setupStateListeners_castleAbilities() {
	ELEMENTS.castleAbilities.white.addEventListener('change', event => {
		const kingSide = event.target.value.includes('k');
		const queenSide = event.target.value.includes('q');
		let ability = state.castle_abilities.white;
		ability.king_side = kingSide;
		ability.queen_side = queenSide;
		state.castle_abilities = CastleAbilities.new(ability, state.castle_abilities.black);
		refreshState();
	});
	ELEMENTS.castleAbilities.black.addEventListener('change', event => {
		const kingSide = event.target.value.includes('k');
		const queenSide = event.target.value.includes('q');
		let ability = state.castle_abilities.black;
		ability.king_side = kingSide;
		ability.queen_side = queenSide;
		state.castle_abilities = CastleAbilities.new(state.castle_abilities.white, ability);
		refreshState();
	});
}

function setupStateListeners_enPassantFile() {
	ELEMENTS.enPassantFile.addEventListener('change', event => {
		let enPassantFile = (event.target.value == '-' ? null : parseInt(event.target.value));
		state.en_passant_file = enPassantFile;
		refreshState();
	});
}

function setupStateListeners_halfMoves() {
	ELEMENTS.halfMoves.addEventListener('input', event => {
		let previous = state.half_moves;
		let newHalfMoves = parseInt(event.target.value);
		if (newHalfMoves < 0) return;
		if (newHalfMoves.toString() !== event.target.value) return;
		if (previous == newHalfMoves) return;
		state.half_moves = newHalfMoves;
		refreshState();
	});
}

function setupStateListeners_fullMoves() {
	ELEMENTS.fullMoves.addEventListener('input', event => {
		let previous = state.half_moves;
		let newFullMoves = parseInt(event.target.value);
		if (newFullMoves < 1) return;
		if (newFullMoves.toString() !== event.target.value) return;
		if (previous == newFullMoves) return;
		state.full_moves = newFullMoves;
		refreshState();
	});
}

function onBoardElementCellClick(event) {
	let selectedPiece = getSelectedPiece();
	let previousPiece = state.get_cell(Position.new(event.detail.cellPosition.rank, event.detail.cellPosition.file));
	let position = Position.new(event.detail.cellPosition.rank, event.detail.cellPosition.file);
	if (selectedPiece == null || (previousPiece != null && arePiecesEqual(previousPiece, selectedPiece)))
		state.clear_cell(position);
	else
		state.set_cell(position, selectedPiece);
	refreshBoardAndState();
}

function getSelectedPieceName() {
	let element = document.querySelector('#piece-selection input[type=radio][name=selected-piece]:checked');
	return element == null ? null : element.value;
}

function getSelectedPiece() {
	if (getSelectedPiece._LOOKUP === undefined) {
		getSelectedPiece._LOOKUP = {
			'white-pawn': { color: PieceColor.White, kind: PieceKind.Pawn },
			'white-rook': { color: PieceColor.White, kind: PieceKind.Rook },
			'white-knight': { color: PieceColor.White, kind: PieceKind.Knight },
			'white-bishop': { color: PieceColor.White, kind: PieceKind.Bishop },
			'white-queen': { color: PieceColor.White, kind: PieceKind.Queen },
			'white-king': { color: PieceColor.White, kind: PieceKind.King },
			'black-pawn': { color: PieceColor.Black, kind: PieceKind.Pawn },
			'black-rook': { color: PieceColor.Black, kind: PieceKind.Rook },
			'black-knight': { color: PieceColor.Black, kind: PieceKind.Knight },
			'black-bishop': { color: PieceColor.Black, kind: PieceKind.Bishop },
			'black-queen': { color: PieceColor.Black, kind: PieceKind.Queen },
			'black-king': { color: PieceColor.Black, kind: PieceKind.King },
			'delete': null,
		};
	}
	let name = getSelectedPieceName();
	if (name == null) return null;
	let looked_up = getSelectedPiece._LOOKUP[name];
	return looked_up == null ? null : Piece.new(looked_up.color, looked_up.kind);
}

function arePiecesEqual(lhs, rhs) {
	return lhs.color == rhs.color && lhs.kind == rhs.kind;
}

function onCopyFenToClipboard() {
	navigator.clipboard.writeText(ELEMENTS.fenText.textContent);
}

function refreshBoardAndState() {
	Board.refresh(state.board());
	refreshState();
}

function refreshState() {
	refreshState_currentPlayer();
	refreshState_castleAbilities();
	refreshState_enPassantFile();
	refreshState_halfMoves();
	refreshState_fullMoves();
	refreshState_fenText();
}

function refreshState_currentPlayer() {
	const isWhite = (state.current_player == PieceColor.White);
	const currentPlayerName = (isWhite ? 'white' : 'black');
	document.querySelector(`#game-state_current-player input[type=radio][name=game-state_current-player][value=${currentPlayerName}]`).checked = true;
}

function refreshState_castleAbilities() {
	const abilityToTextValue = (ability) => {
		const key = ((ability.king_side & 1) << 1) | (ability.queen_side & 1);
		return [ "-", "q", "k" , "kq"][key]
	};
	ELEMENTS.castleAbilities.white.value = abilityToTextValue(state.castle_abilities.white);
	ELEMENTS.castleAbilities.black.value = abilityToTextValue(state.castle_abilities.black);
}

function refreshState_enPassantFile() {
	ELEMENTS.enPassantFile.value = (state.en_passant_file == null ? '-' : state.en_passant_file);
}

function refreshState_halfMoves() {
	ELEMENTS.halfMoves.value = state.half_moves;
}

function refreshState_fullMoves() {
	ELEMENTS.fullMoves.value = state.full_moves;
}

function refreshState_fenText() {
	ELEMENTS.fenText.textContent = state.render_fen();
}

let state = null;
const ELEMENTS = {
	castleAbilities: {
		white: document.getElementById('game-state_castle-abilities_white'),
		black: document.getElementById('game-state_castle-abilities_black'),
	},
	enPassantFile: document.getElementById('game-state_en-passant-file'),
	fenText: document.getElementById('game-state_fen'),
	halfMoves: document.getElementById('game-state_half-moves'),
	fullMoves: document.getElementById('game-state_full-moves'),
};

