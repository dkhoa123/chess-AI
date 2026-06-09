import { isSquareUnderAttack } from './check.js'
import { isKingInCheck } from './check.js'
// castlingRights: { wKing, wRookK, wRookQ, bKing, bRookK, bRookQ }
// mỗi field = true nghĩa là quân đó CHƯA di chuyển (còn quyền nhập thành)
export function getInitialCastlingRights() {
    return {
        wKing: true, wRookK: true, wRookQ: true,
        bKing: true, bRookK: true, bRookQ: true
    };
}

// Cập nhật castlingRights sau mỗi nước đi
export function updateCastlingRights(rights, fromRow, fromCol, piece) {
    const newRights = { ...rights };

    if (piece === 'wk') newRights.wKing = false;
    if (piece === 'bk') newRights.bKing = false;

    // Xe trắng
    if (fromRow === 7 && fromCol === 7) newRights.wRookK = false;
    if (fromRow === 7 && fromCol === 0) newRights.wRookQ = false;

    // Xe đen
    if (fromRow === 0 && fromCol === 7) newRights.bRookK = false;
    if (fromRow === 0 && fromCol === 0) newRights.bRookQ = false;

    return newRights;
}

// Kiểm tra nhập thành có hợp lệ không
export function canCastle(board, castlingRights, isWhite, side) {
    const row = isWhite ? 7 : 0;

    // Vua chưa di chuyển
    if (isWhite && !castlingRights.wKing) return false;
    if (!isWhite && !castlingRights.bKing) return false;

    // Vua không đang bị chiếu
    if (isKingInCheck(board, isWhite)) return false;

    if (side === 'kingside') {
        // Xe chưa di chuyển
        if (isWhite && !castlingRights.wRookK) return false;
        if (!isWhite && !castlingRights.bRookK) return false;

        // Đường đi trống
        if (board[row][5] || board[row][6]) return false;

        // Vua không đi qua ô bị tấn công
        if (isSquareUnderAttack(board, row, 5, !isWhite)) return false;
        if (isSquareUnderAttack(board, row, 6, !isWhite)) return false;

        return true;
    }

    if (side === 'queenside') {
        // Xe chưa di chuyển
        if (isWhite && !castlingRights.wRookQ) return false;
        if (!isWhite && !castlingRights.bRookQ) return false;

        // Đường đi trống
        if (board[row][1] || board[row][2] || board[row][3]) return false;

        // Vua không đi qua ô bị tấn công
        if (isSquareUnderAttack(board, row, 3, !isWhite)) return false;
        if (isSquareUnderAttack(board, row, 2, !isWhite)) return false;

        return true;
    }

    return false;
}

// Thực hiện nhập thành - trả về board mới
export function applyCastleMove(board, fromRow, fromCol, toCol) {
    const newBoard = board.map(row => [...row]);
    const king = newBoard[fromRow][fromCol];
    const isKingside = toCol === 6;

    // Di chuyển vua
    newBoard[fromRow][fromCol] = null;
    newBoard[fromRow][toCol] = king;

    // Di chuyển xe
    const rookFromCol = isKingside ? 7 : 0;
    const rookToCol = isKingside ? 5 : 3;
    const rook = newBoard[fromRow][rookFromCol];
    newBoard[fromRow][rookFromCol] = null;
    newBoard[fromRow][rookToCol] = rook;

    return newBoard;
}