import {canCastle} from './castling.js';

// Kiểm tra nước đi hợp lệ (bao gồm nhập thành và bắt tốt qua đường)
// enPassantTarget: { row, col } | null - ô mà tốt có thể di chuyển tới để bắt qua đường
export function isValidMove(board, fromRow, fromCol, toRow, toCol, castlingRights, enPassantTarget) {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece[0] === piece[0]) return false;

    const pieceType = piece[1];

    switch (pieceType) {
        case 'p':
            return isValidPawnMove(board, fromRow, fromCol, toRow, toCol, piece, enPassantTarget);
        case 'r':
            return isValidRookMove(board, fromRow, fromCol, toRow, toCol);
        case 'n':
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b':
            return isValidBishopMove(board, fromRow, fromCol, toRow, toCol);
        case 'q':
            return isValidQueenMove(board, fromRow, fromCol, toRow, toCol);
        case 'k':
            return isValidKingMove(board, fromRow, fromCol, toRow, toCol, piece, castlingRights);
        default:
            return false;
    }
}

function isValidPawnMove(board, fromRow, fromCol, toRow, toCol, piece, enPassantTarget) {
    const isWhite = piece[0] === 'w';
    const direction = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    if (fromCol === toCol) {
        if (toRow === fromRow + direction && board[toRow][toCol] === null) return true;

        if (fromRow === startRow &&
            toRow === fromRow + 2 * direction &&
            board[toRow][toCol] === null &&
            board[fromRow + direction][toCol] === null) return true;
    }

    if (Math.abs(toCol - fromCol) === 1 &&
        toRow === fromRow + direction &&
        board[toRow][toCol] !== null &&
        board[toRow][toCol][0] !== piece[0]) return true;

    // Bắt tốt qua đường (en passant)
    if (enPassantTarget &&
        Math.abs(toCol - fromCol) === 1 &&
        toRow === fromRow + direction &&
        toRow === enPassantTarget.row &&
        toCol === enPassantTarget.col &&
        board[toRow][toCol] === null) {
        return true;
    }

    return false;
}

function isValidRookMove(board, fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    if (fromRow === toRow && fromCol === toCol) return false;
    return isPathClear(board, fromRow, fromCol, toRow, toCol);
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(board, fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (rowDiff !== colDiff || rowDiff === 0) return false;
    return isPathClear(board, fromRow, fromCol, toRow, toCol);
}

function isValidQueenMove(board, fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    if (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) {
        if (rowDiff === 0 && colDiff === 0) return false;
        return isPathClear(board, fromRow, fromCol, toRow, toCol);
    }
    return false;
}

function isValidKingMove(board, fromRow, fromCol, toRow, toCol, piece, castlingRights) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    // Nước đi thường
    if (rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0)) return true;

    // Nhập thành: vua đi 2 ô ngang, phải xuất phát từ cột 4
    if (rowDiff === 0 && colDiff === 2 && fromCol === 4 && castlingRights) {
        const isWhite = piece[0] === 'w';
        if (toCol === 6) return canCastle(board, castlingRights, isWhite, 'kingside');
        if (toCol === 2) return canCastle(board, castlingRights, isWhite, 'queenside');
    }

    return false;
}

export function isPathClear(board, fromRow, fromCol, toRow, toCol) {
    const rowDir = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colDir = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);

    let currRow = fromRow + rowDir;
    let currCol = fromCol + colDir;

    while (currRow !== toRow || currCol !== toCol) {
        if (board[currRow][currCol] !== null) return false;
        currRow += rowDir;
        currCol += colDir;
    }

    return true;
}

// Quân tốt bị bắt qua đường nằm ở đâu, dựa trên ô đích (to) và hướng đi
// Dùng khi thực sự thực hiện nước đi en passant trên board
export function getEnPassantCapturedSquare(toRow, toCol, isWhite) {
    // Quân tốt bị bắt luôn nằm cùng hàng với quân tốt đi (fromRow), cùng cột với toCol
    // isWhite đang đi thì quân bị bắt là tốt đen nằm ở hàng toRow + 1 (phía dưới ô đích)
    const capturedRow = isWhite ? toRow + 1 : toRow - 1;
    return { row: capturedRow, col: toCol };
}