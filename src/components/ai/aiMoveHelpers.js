import { getEnPassantCapturedSquare } from '../gameLogic/movement.js'

// Áp dụng một nước đi giả định lên board, trả về { newBoard, newEnPassantTarget }
// Dùng trong các thuật toán AI (Material/Minimax/AlphaBeta) để mô phỏng nước đi
// có xử lý đúng bắt tốt qua đường, và tính ô en passant mới cho lượt kế tiếp.
export function simulateMove(board, fromRow, fromCol, toRow, toCol, enPassantTarget) {
    const piece = board[fromRow][fromCol];
    const isWhitePiece = piece[0] === 'w';
    const isPawn = piece[1] === 'p';

    const isEnPassantCapture = isPawn &&
        enPassantTarget &&
        toRow === enPassantTarget.row &&
        toCol === enPassantTarget.col &&
        fromCol !== toCol &&
        board[toRow][toCol] === null;

    const newBoard = board.map(r => [...r]);

    if (isEnPassantCapture) {
        const { row: capRow, col: capCol } = getEnPassantCapturedSquare(toRow, toCol, isWhitePiece);
        newBoard[capRow][capCol] = null;
    }

    newBoard[fromRow][fromCol] = null;
    newBoard[toRow][toCol] = piece;

    let newEnPassantTarget = null;
    if (isPawn && Math.abs(toRow - fromRow) === 2) {
        newEnPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
    }

    return { newBoard, newEnPassantTarget };
}