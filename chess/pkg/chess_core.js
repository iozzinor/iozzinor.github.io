let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_export_0.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_0.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * The game has ended.
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}
 */
export const EndStatus = Object.freeze({
    /**
     * Both players agreed to end with draw.
     */
    DrawAgreement: 0, "0": "DrawAgreement",
    /**
     * One of the players was in stalemate position.
     */
    DrawStalemate: 1, "1": "DrawStalemate",
    /**
     * Application of the three-fold rule.
     */
    DrawThreeFold: 2, "2": "DrawThreeFold",
    /**
     * Application of the fifty-move rule.
     */
    DrawFiftyMove: 3, "3": "DrawFiftyMove",
    /**
     * Not enough material to end to checkmate.
     */
    DrawMaterial: 4, "4": "DrawMaterial",
    /**
     * White was checkmated.
     */
    WhiteCheckmated: 5, "5": "WhiteCheckmated",
    /**
     * Black was checkmated.
     */
    BlackCheckmated: 6, "6": "BlackCheckmated",
    /**
     * White resigned.
     */
    WhiteResigned: 7, "7": "WhiteResigned",
    /**
     * Black resigned.
     */
    BlackResigned: 8, "8": "BlackResigned",
    /**
     * White ran out of time.
     */
    WhiteTimeout: 9, "9": "WhiteTimeout",
    /**
     * Black ran out of time.
     */
    BlackTimeout: 10, "10": "BlackTimeout",
});
/**
 * Wasm chess move.
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}
 */
export const MoveKind = Object.freeze({
    /**
     * Move the piece.
     */
    Move: 0, "0": "Move",
    /**
     * Promote to queen.
     */
    PromoteQueen: 1, "1": "PromoteQueen",
    /**
     * Promote to knight.
     */
    PromoteKnight: 2, "2": "PromoteKnight",
    /**
     * Promote to bishop.
     */
    PromoteBishop: 3, "3": "PromoteBishop",
    /**
     * Promote to rook.
     */
    PromoteRook: 4, "4": "PromoteRook",
    /**
     * en-passant
     */
    EnPassant: 5, "5": "EnPassant",
    /**
     * Castle king side.
     */
    CastleKing: 6, "6": "CastleKing",
    /**
     * Castle queen side.
     */
    CastleQueen: 7, "7": "CastleQueen",
});
/**
 * Wasm piece color.
 * @enum {0 | 1}
 */
export const PieceColor = Object.freeze({
    /**
     * First player to move.
     */
    White: 0, "0": "White",
    /**
     * Second player to move.
     */
    Black: 1, "1": "Black",
});
/**
 * Wasm piece kind.
 * @enum {1 | 2 | 3 | 4 | 5 | 6}
 */
export const PieceKind = Object.freeze({
    /**
     * pawn.
     */
    Pawn: 1, "1": "Pawn",
    /**
     * rook.
     */
    Rook: 2, "2": "Rook",
    /**
     * knight.
     */
    Knight: 3, "3": "Knight",
    /**
     * bishop.
     */
    Bishop: 4, "4": "Bishop",
    /**
     * queen.
     */
    Queen: 5, "5": "Queen",
    /**
     * king.
     */
    King: 6, "6": "King",
});
/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5}
 */
export const PlayError = Object.freeze({
    GameEnded: 0, "0": "GameEnded",
    DrawResponseRequired: 1, "1": "DrawResponseRequired",
    DrawResponseNotAllowed: 2, "2": "DrawResponseNotAllowed",
    TurnInvalid: 3, "3": "TurnInvalid",
    PieceInvalid: 4, "4": "PieceInvalid",
    CellEmpty: 5, "5": "CellEmpty",
});

const BoardFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_board_free(ptr >>> 0, 1));
/**
 * Wasm board.
 */
export class Board {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Board.prototype);
        obj.__wbg_ptr = ptr;
        BoardFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        BoardFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_board_free(ptr, 0);
    }
    /**
     * Get the piece at the given index.
     * @param {number} rank
     * @param {number} file
     * @returns {Piece | undefined}
     */
    get_cell(rank, file) {
        const ret = wasm.board_get_cell(this.__wbg_ptr, rank, file);
        return ret === 0 ? undefined : Piece.__wrap(ret);
    }
    /**
     * Whether the current board is checked.
     * @param {PieceColor} color
     * @returns {boolean}
     */
    is_checked(color) {
        const ret = wasm.board_is_checked(this.__wbg_ptr, color);
        return ret !== 0;
    }
}

const CastleAbilitiesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_castleabilities_free(ptr >>> 0, 1));

export class CastleAbilities {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CastleAbilities.prototype);
        obj.__wbg_ptr = ptr;
        CastleAbilitiesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CastleAbilitiesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_castleabilities_free(ptr, 0);
    }
    /**
     * @returns {CastleAbility}
     */
    get white() {
        const ret = wasm.__wbg_get_castleabilities_white(this.__wbg_ptr);
        return CastleAbility.__wrap(ret);
    }
    /**
     * @param {CastleAbility} arg0
     */
    set white(arg0) {
        _assertClass(arg0, CastleAbility);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_castleabilities_white(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {CastleAbility}
     */
    get black() {
        const ret = wasm.__wbg_get_castleabilities_black(this.__wbg_ptr);
        return CastleAbility.__wrap(ret);
    }
    /**
     * @param {CastleAbility} arg0
     */
    set black(arg0) {
        _assertClass(arg0, CastleAbility);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_castleabilities_black(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {CastleAbility} white
     * @param {CastleAbility} black
     * @returns {CastleAbilities}
     */
    static new(white, black) {
        _assertClass(white, CastleAbility);
        var ptr0 = white.__destroy_into_raw();
        _assertClass(black, CastleAbility);
        var ptr1 = black.__destroy_into_raw();
        const ret = wasm.castleabilities_new(ptr0, ptr1);
        return CastleAbilities.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    render_text() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.castleabilities_render_text(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const CastleAbilityFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_castleability_free(ptr >>> 0, 1));

export class CastleAbility {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CastleAbility.prototype);
        obj.__wbg_ptr = ptr;
        CastleAbilityFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CastleAbilityFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_castleability_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get king_side() {
        const ret = wasm.__wbg_get_castleability_king_side(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set king_side(arg0) {
        wasm.__wbg_set_castleability_king_side(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {boolean}
     */
    get queen_side() {
        const ret = wasm.__wbg_get_castleability_queen_side(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {boolean} arg0
     */
    set queen_side(arg0) {
        wasm.__wbg_set_castleability_queen_side(this.__wbg_ptr, arg0);
    }
}

const GameFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_game_free(ptr >>> 0, 1));
/**
 * The chess game.
 */
export class Game {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Game.prototype);
        obj.__wbg_ptr = ptr;
        GameFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GameFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_game_free(ptr, 0);
    }
    /**
     * New default game.
     * @returns {Game}
     */
    static new() {
        const ret = wasm.game_new();
        return Game.__wrap(ret);
    }
    /**
     * @param {string} text
     * @returns {Game | undefined}
     */
    static try_from_fen(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.game_try_from_fen(ptr0, len0);
        return ret === 0 ? undefined : Game.__wrap(ret);
    }
    /**
     * Get the game FEN representation.
     * @returns {string}
     */
    render_fen() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.game_render_fen(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Get the current game state.
     * @returns {State}
     */
    state() {
        const ret = wasm.game_state(this.__wbg_ptr);
        return State.__wrap(ret);
    }
    /**
     * Get the end status, if the game has ended.
     * @returns {EndStatus | undefined}
     */
    end_status() {
        const ret = wasm.game_end_status(this.__wbg_ptr);
        return ret === 11 ? undefined : ret;
    }
    /**
     * Attempt to resign.
     */
    forfeit() {
        const ret = wasm.game_forfeit(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Attempt to propose draw.
     */
    propose_draw() {
        const ret = wasm.game_propose_draw(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Attempt to accept draw.
     */
    accept_draw() {
        const ret = wasm.game_accept_draw(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Attempt to reject draw.
     */
    accept_reject() {
        const ret = wasm.game_accept_reject(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {Position} position
     * @param {PieceMove} piece_move
     */
    play_piece_move(position, piece_move) {
        _assertClass(position, Position);
        var ptr0 = position.__destroy_into_raw();
        _assertClass(piece_move, PieceMove);
        var ptr1 = piece_move.__destroy_into_raw();
        const ret = wasm.game_play_piece_move(this.__wbg_ptr, ptr0, ptr1);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * List of playable pieces.
     * @returns {PlayablePiece[]}
     */
    playable_pieces() {
        const ret = wasm.game_playable_pieces(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}

const PieceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_piece_free(ptr >>> 0, 1));
/**
 * Wasm piece.
 */
export class Piece {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Piece.prototype);
        obj.__wbg_ptr = ptr;
        PieceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PieceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_piece_free(ptr, 0);
    }
    /**
     * The player the piece belongs to.
     * @returns {PieceColor}
     */
    get color() {
        const ret = wasm.__wbg_get_piece_color(this.__wbg_ptr);
        return ret;
    }
    /**
     * The player the piece belongs to.
     * @param {PieceColor} arg0
     */
    set color(arg0) {
        wasm.__wbg_set_piece_color(this.__wbg_ptr, arg0);
    }
    /**
     * The type of piece.
     * @returns {PieceKind}
     */
    get kind() {
        const ret = wasm.__wbg_get_piece_kind(this.__wbg_ptr);
        return ret;
    }
    /**
     * The type of piece.
     * @param {PieceKind} arg0
     */
    set kind(arg0) {
        wasm.__wbg_set_piece_kind(this.__wbg_ptr, arg0);
    }
    /**
     * Create a new piece.
     * @param {PieceColor} color
     * @param {PieceKind} kind
     * @returns {Piece}
     */
    static new(color, kind) {
        const ret = wasm.piece_new(color, kind);
        return Piece.__wrap(ret);
    }
    /**
     * Unicode text representation for the piece.
     * @returns {string}
     */
    render_unicode() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.piece_render_unicode(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Letter representation for the piece.
     * @returns {string}
     */
    render_letter() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.piece_render_letter(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const PieceMoveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_piecemove_free(ptr >>> 0, 1));
/**
 * Move to perform.
 */
export class PieceMove {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PieceMove.prototype);
        obj.__wbg_ptr = ptr;
        PieceMoveFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PieceMoveFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_piecemove_free(ptr, 0);
    }
    /**
     * The destination.
     * @returns {Position}
     */
    get target() {
        const ret = wasm.__wbg_get_piecemove_target(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
     * The destination.
     * @param {Position} arg0
     */
    set target(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_piecemove_target(this.__wbg_ptr, ptr0);
    }
    /**
     * Move kind.
     * @returns {MoveKind}
     */
    get kind() {
        const ret = wasm.__wbg_get_piecemove_kind(this.__wbg_ptr);
        return ret;
    }
    /**
     * Move kind.
     * @param {MoveKind} arg0
     */
    set kind(arg0) {
        wasm.__wbg_set_piecemove_kind(this.__wbg_ptr, arg0);
    }
}

const PlayablePieceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_playablepiece_free(ptr >>> 0, 1));
/**
 * Wasm playable piece.
 */
export class PlayablePiece {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(PlayablePiece.prototype);
        obj.__wbg_ptr = ptr;
        PlayablePieceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PlayablePieceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_playablepiece_free(ptr, 0);
    }
    /**
     * Piece position.
     * @returns {Position}
     */
    get position() {
        const ret = wasm.__wbg_get_playablepiece_position(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
     * Piece position.
     * @param {Position} arg0
     */
    set position(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_playablepiece_position(this.__wbg_ptr, ptr0);
    }
    /**
     * Allowed moves.
     * @returns {PieceMove[]}
     */
    moves() {
        const ret = wasm.playablepiece_moves(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}

const PositionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_position_free(ptr >>> 0, 1));
/**
 * Wasm position.
 */
export class Position {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Position.prototype);
        obj.__wbg_ptr = ptr;
        PositionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PositionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_position_free(ptr, 0);
    }
    /**
     * rank.
     * @returns {number}
     */
    get rank() {
        const ret = wasm.__wbg_get_position_rank(this.__wbg_ptr);
        return ret;
    }
    /**
     * rank.
     * @param {number} arg0
     */
    set rank(arg0) {
        wasm.__wbg_set_position_rank(this.__wbg_ptr, arg0);
    }
    /**
     * file.
     * @returns {number}
     */
    get file() {
        const ret = wasm.__wbg_get_position_file(this.__wbg_ptr);
        return ret;
    }
    /**
     * file.
     * @param {number} arg0
     */
    set file(arg0) {
        wasm.__wbg_set_position_file(this.__wbg_ptr, arg0);
    }
    /**
     * Initialize position.
     * @param {number} rank
     * @param {number} file
     * @returns {Position}
     */
    static new(rank, file) {
        const ret = wasm.position_new(rank, file);
        return Position.__wrap(ret);
    }
    /**
     * Position to text.
     * @returns {string}
     */
    render_text() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.position_render_text(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}

const StateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_state_free(ptr >>> 0, 1));

export class State {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(State.prototype);
        obj.__wbg_ptr = ptr;
        StateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StateFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_state_free(ptr, 0);
    }
    /**
     * @returns {PieceColor}
     */
    get current_player() {
        const ret = wasm.__wbg_get_state_current_player(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {PieceColor} arg0
     */
    set current_player(arg0) {
        wasm.__wbg_set_state_current_player(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {CastleAbilities}
     */
    get castle_abilities() {
        const ret = wasm.__wbg_get_state_castle_abilities(this.__wbg_ptr);
        return CastleAbilities.__wrap(ret);
    }
    /**
     * @param {CastleAbilities} arg0
     */
    set castle_abilities(arg0) {
        _assertClass(arg0, CastleAbilities);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_state_castle_abilities(this.__wbg_ptr, ptr0);
    }
    /**
     * @returns {number | undefined}
     */
    get en_passant_file() {
        const ret = wasm.__wbg_get_state_en_passant_file(this.__wbg_ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
    /**
     * @param {number | null} [arg0]
     */
    set en_passant_file(arg0) {
        wasm.__wbg_set_state_en_passant_file(this.__wbg_ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0);
    }
    /**
     * @returns {number}
     */
    get half_moves() {
        const ret = wasm.__wbg_get_state_half_moves(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set half_moves(arg0) {
        wasm.__wbg_set_state_half_moves(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get full_moves() {
        const ret = wasm.__wbg_get_state_full_moves(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set full_moves(arg0) {
        wasm.__wbg_set_state_full_moves(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {State}
     */
    static empty() {
        const ret = wasm.state_empty();
        return State.__wrap(ret);
    }
    /**
     * @returns {State}
     */
    static new() {
        const ret = wasm.state_new();
        return State.__wrap(ret);
    }
    /**
     * @param {string} text
     * @returns {State | undefined}
     */
    static try_from_fen(text) {
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.state_try_from_fen(ptr0, len0);
        return ret === 0 ? undefined : State.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    render_fen() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.state_render_fen(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {Board}
     */
    board() {
        const ret = wasm.state_board(this.__wbg_ptr);
        return Board.__wrap(ret);
    }
    /**
     * @param {Position} position
     * @param {Piece | null} [cell]
     */
    set_cell(position, cell) {
        _assertClass(position, Position);
        var ptr0 = position.__destroy_into_raw();
        let ptr1 = 0;
        if (!isLikeNone(cell)) {
            _assertClass(cell, Piece);
            ptr1 = cell.__destroy_into_raw();
        }
        wasm.state_set_cell(this.__wbg_ptr, ptr0, ptr1);
    }
    /**
     * @param {Position} position
     */
    clear_cell(position) {
        _assertClass(position, Position);
        var ptr0 = position.__destroy_into_raw();
        wasm.state_clear_cell(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Position} position
     * @returns {Piece | undefined}
     */
    get_cell(position) {
        _assertClass(position, Position);
        var ptr0 = position.__destroy_into_raw();
        const ret = wasm.state_get_cell(this.__wbg_ptr, ptr0);
        return ret === 0 ? undefined : Piece.__wrap(ret);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_piecemove_new = function(arg0) {
        const ret = PieceMove.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_playablepiece_new = function(arg0) {
        const ret = PlayablePiece.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_0;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('chess_core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
