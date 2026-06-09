import { isValidMove } from './movement.js'
import {isMoveLegal, isKingInCheck} from './check.js'
// Logic game cờ vua: lượt chơi, chiếu, chiếu bí, hòa, nhập thành
// Lấy tất cả các nước đi hợp lệ cho một quân
export function getValidMovesForPiece(board, row, col, castlingRights) {
    const piece = board[row][col];
    if (!piece) return [];

    const isWhite = piece[0] === 'w';
    const validMoves = [];

    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            if (toRow === row && toCol === col) continue;

            const targetPiece = board[toRow][toCol];
            if (targetPiece && targetPiece[0] === piece[0]) continue;

            if (isValidMove(board, row, col, toRow, toCol, castlingRights)) {
                if (isMoveLegal(board, row, col, toRow, toCol, isWhite)) {
                    validMoves.push({ row: toRow, col: toCol });
                }
            }
        }
    }

    return validMoves;
}

// Kiểm tra xem bên nào có nước đi hợp lệ không
export function hasLegalMove(board, isWhite, castlingRights) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece[0] !== (isWhite ? 'w' : 'b')) continue;

            const validMoves = getValidMovesForPiece(board, row, col, castlingRights);
            if (validMoves.length > 0) return true;
        }
    }
    return false;
}

// Kiểm tra trạng thái game
export function getGameStatus(board, isWhiteTurn, castlingRights) {
    const inCheck = isKingInCheck(board, isWhiteTurn);
    const hasMove = hasLegalMove(board, isWhiteTurn, castlingRights);

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

