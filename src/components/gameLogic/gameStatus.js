import { isValidMove } from './movement.js'
import {isMoveLegal, isKingInCheck} from './check.js'
// Logic game cờ vua: lượt chơi, chiếu, chiếu bí, hòa, nhập thành, bắt tốt qua đường

// Lấy tất cả các nước đi hợp lệ cho một quân
export function getValidMovesForPiece(board, row, col, castlingRights, enPassantTarget) {
    const piece = board[row][col];
    if (!piece) return [];

    const isWhite = piece[0] === 'w';
    const validMoves = [];

    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            if (toRow === row && toCol === col) continue;

            const targetPiece = board[toRow][toCol];
            if (targetPiece && targetPiece[0] === piece[0]) continue;

            if (isValidMove(board, row, col, toRow, toCol, castlingRights, enPassantTarget)) {
                if (isMoveLegal(board, row, col, toRow, toCol, isWhite, enPassantTarget)) {
                    validMoves.push({ row: toRow, col: toCol });
                }
            }
        }
    }

    return validMoves;
}

// Kiểm tra xem bên nào có nước đi hợp lệ không
export function hasLegalMove(board, isWhite, castlingRights, enPassantTarget) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece[0] !== (isWhite ? 'w' : 'b')) continue;

            const validMoves = getValidMovesForPiece(board, row, col, castlingRights, enPassantTarget);
            if (validMoves.length > 0) return true;
        }
    }
    return false;
}

// ==================== HÒA DO THIẾU VẬT LIỆU ====================
// Các trường hợp hòa do thiếu vật liệu (không bên nào có thể chiếu bí):
// - Vua đơn độc vs Vua đơn độc
// - Vua + Mã vs Vua đơn độc
// - Vua + Tượng vs Vua đơn độc
// - Vua + Tượng vs Vua + Tượng (cùng màu ô - tượng cùng màu)
export function isInsufficientMaterial(board) {
    const pieces = { w: [], b: [] };

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece) continue;
            const color = piece[0];
            const type = piece[1];
            if (type === 'k') continue; // vua không tính
            pieces[color].push({ type, row, col });
        }
    }

    const whitePieces = pieces.w;
    const blackPieces = pieces.b;

    // Nếu một bên có quân nặng (xe, hậu) hoặc nhiều hơn 1 quân nhẹ phối hợp được -> không phải hòa
    const isOnlyMinor = (arr) => arr.every(p => p.type === 'n' || p.type === 'b');

    if (!isOnlyMinor(whitePieces) || !isOnlyMinor(blackPieces)) return false;

    // Vua vs Vua
    if (whitePieces.length === 0 && blackPieces.length === 0) return true;

    // Vua vs Vua + 1 quân nhẹ (mã hoặc tượng)
    if (whitePieces.length === 0 && blackPieces.length === 1) return true;
    if (blackPieces.length === 0 && whitePieces.length === 1) return true;

    // Vua + Tượng vs Vua + Tượng, cùng màu ô (không thể chiếu bí)
    if (whitePieces.length === 1 && blackPieces.length === 1 &&
        whitePieces[0].type === 'b' && blackPieces[0].type === 'b') {
        const sameColorSquare = (p) => (p.row + p.col) % 2;
        if (sameColorSquare(whitePieces[0]) === sameColorSquare(blackPieces[0])) {
            return true;
        }
    }

    return false;
}

// ==================== TẠO KEY VỊ TRÍ (dùng cho lặp 3 lần) ====================
// Mã hóa board + lượt đi + quyền nhập thành + en passant target thành 1 chuỗi duy nhất
export function getPositionKey(board, isWhiteTurn, castlingRights, enPassantTarget) {
    const boardStr = board.map(r => r.map(c => c ?? '--').join(',')).join('|');
    const turnStr = isWhiteTurn ? 'w' : 'b';
    const castleStr = castlingRights
        ? `${castlingRights.wKing ? 1 : 0}${castlingRights.wRookK ? 1 : 0}${castlingRights.wRookQ ? 1 : 0}${castlingRights.bKing ? 1 : 0}${castlingRights.bRookK ? 1 : 0}${castlingRights.bRookQ ? 1 : 0}`
        : '000000';
    const epStr = enPassantTarget ? `${enPassantTarget.row}${enPassantTarget.col}` : '--';
    return `${boardStr}_${turnStr}_${castleStr}_${epStr}`;
}

// ==================== KIỂM TRA TRẠNG THÁI GAME ====================
// positionCounts: object { [positionKey]: count } - để kiểm tra lặp 3 lần
// halfmoveClock: số nửa-nước không có bắt quân/đi tốt liên tiếp - để kiểm tra hòa 50 nước
export function getGameStatus(board, isWhiteTurn, castlingRights, enPassantTarget, positionCounts, halfmoveClock) {
    const inCheck = isKingInCheck(board, isWhiteTurn);
    const hasMove = hasLegalMove(board, isWhiteTurn, castlingRights, enPassantTarget);

    if (!hasMove) {
        if (inCheck) {
            return {
                status: 'checkmate',
                winner: isWhiteTurn ? 'black' : 'white',
                message: `Chiếu bí! ${isWhiteTurn ? 'Đen' : 'Trắng'} thắng!`
            };
        } else {
            return {
                status: 'stalemate',
                winner: null,
                message: 'Hòa cờ - không còn nước đi'
            };
        }
    }

    // Hòa do thiếu vật liệu
    if (isInsufficientMaterial(board)) {
        return {
            status: 'insufficient_material',
            winner: null,
            message: 'Hòa cờ - thiếu vật liệu để chiếu bí'
        };
    }

    // Hòa do 50 nước (50 nước đi đầy đủ = 100 nửa-nước không bắt quân/đi tốt)
    if (halfmoveClock !== undefined && halfmoveClock >= 100) {
        return {
            status: 'fifty_move',
            winner: null,
            message: 'Hòa cờ - luật 50 nước'
        };
    }

    // Hòa do lặp lại vị trí 3 lần
    if (positionCounts) {
        const currentKey = getPositionKey(board, isWhiteTurn, castlingRights, enPassantTarget);
        if ((positionCounts[currentKey] ?? 0) >= 3) {
            return {
                status: 'threefold_repetition',
                winner: null,
                message: 'Hòa cờ - lặp lại vị trí 3 lần'
            };
        }
    }

    if (inCheck) {
        return {
            status: 'check',
            winner: null,
            message: `${isWhiteTurn ? 'Trắng' : 'Đen'} bị chiếu!`
        };
    }

    return {
        status: 'playing',
        winner: null,
        message: `Lượt của ${isWhiteTurn ? '⚪ Trắng' : '⚫ Đen'}`
    };
}