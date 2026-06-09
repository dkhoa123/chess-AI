import {isPathClear} from './movement.js'
import { applyCastleMove } from './castling.js'
// Tìm vị trí vua
export function findKing(board, isWhite) {
    const kingPiece = isWhite ? 'wk' : 'bk';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingPiece) {
                return { row, col };
            }
        }
    }
    return null;
}

// Kiểm tra ô có bị tấn công không
export function isSquareUnderAttack(board, row, col, byWhite) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const pieceColor = piece[0];
            if ((byWhite && pieceColor !== 'w') || (!byWhite && pieceColor !== 'b')) continue;

            if (canPieceAttack(board, r, c, row, col, piece)) return true;
        }
    }
    return false;
}

function canPieceAttack(board, fromRow, fromCol, toRow, toCol, piece) {
    const pieceType = piece[1];

    if (pieceType === 'p') {
        const isWhite = piece[0] === 'w';
        const direction = isWhite ? -1 : 1;
        return toRow === fromRow + direction && Math.abs(toCol - fromCol) === 1;
    }

    return isValidMoveLogic(board, fromRow, fromCol, toRow, toCol, pieceType);
}

// Kiểm tra vua có bị chiếu không
export function isKingInCheck(board, isWhite) {
    const king = findKing(board, isWhite);
    if (!king) return false;
    return isSquareUnderAttack(board, king.row, king.col, !isWhite);
}

// Kiểm tra nước đi có hợp lệ sau khi tính chiếu
export function isMoveLegal(board, fromRow, fromCol, toRow, toCol, isWhite) {
    const piece = board[fromRow][fromCol];
    const isKingMove = piece && piece[1] === 'k';
    const isCastling = isKingMove && fromCol === 4 && Math.abs(toCol - fromCol) === 2;

    let testBoard;
    if (isCastling) {
        testBoard = applyCastleMove(board, fromRow, fromCol, toCol);
    } else {
        testBoard = board.map(row => [...row]);
        testBoard[fromRow][fromCol] = null;
        testBoard[toRow][toCol] = piece;
    }

    return !isKingInCheck(testBoard, isWhite);
}

function isValidMoveLogic(board, fromRow, fromCol, toRow, toCol, pieceType) {
    switch (pieceType) {
        case 'r':
            if (fromRow !== toRow && fromCol !== toCol) return false;
            if (fromRow === toRow && fromCol === toCol) return false;
            return isPathClear(board, fromRow, fromCol, toRow, toCol);

        case 'n': {
            const rowDiff = Math.abs(toRow - fromRow);
            const colDiff = Math.abs(toCol - fromCol);
            return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        }

        case 'b': {
            const rDiff = Math.abs(toRow - fromRow);
            const cDiff = Math.abs(toCol - fromCol);
            if (rDiff !== cDiff || rDiff === 0) return false;
            return isPathClear(board, fromRow, fromCol, toRow, toCol);
        }

        case 'q': {
            const rd = Math.abs(toRow - fromRow);
            const cd = Math.abs(toCol - fromCol);
            if (fromRow === toRow || fromCol === toCol || rd === cd) {
                if (rd === 0 && cd === 0) return false;
                return isPathClear(board, fromRow, fromCol, toRow, toCol);
            }
            return false;
        }

        case 'k': {
            const kRowDiff = Math.abs(toRow - fromRow);
            const kColDiff = Math.abs(toCol - fromCol);
            return kRowDiff <= 1 && kColDiff <= 1 && (kRowDiff !== 0 || kColDiff !== 0);
        }

        default:
            return false;
    }
}



