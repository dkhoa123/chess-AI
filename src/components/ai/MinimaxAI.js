import { getValidMovesForPiece, } from '../gameLogic/gameStatus.js'
import evaluateBoard from './EvaluateBoard.js'

// ==================== MINIMAX ALGORITHM (Trung bình) ====================
export function getMinimaxAIMove(board, isWhite, depth = 3) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece[0] !== (isWhite ? 'w' : 'b')) continue;
            
            const moves = getValidMovesForPiece(board, row, col);
            moves.forEach(move => {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = null;
                newBoard[move.row][move.col] = piece;
                
                const score = minimax(newBoard, depth - 1, false, isWhite);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from: { row, col }, to: move };
                }
            });
        }
    }
    
    return bestMove;
}

function minimax(board, depth, isMaximizing, aiIsWhite) {
    if (depth === 0) {
        return evaluateBoard(board, aiIsWhite);
    }
    
    const currentIsWhite = isMaximizing ? aiIsWhite : !aiIsWhite;
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        let hasMove = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece || piece[0] !== (currentIsWhite ? 'w' : 'b')) continue;
                
                const moves = getValidMovesForPiece(board, row, col);
                moves.forEach(move => {
                    hasMove = true;
                    const newBoard = board.map(r => [...r]);
                    newBoard[row][col] = null;
                    newBoard[move.row][move.col] = piece;
                    
                    const score = minimax(newBoard, depth - 1, false, aiIsWhite);
                    maxScore = Math.max(maxScore, score);
                });
            }
        }
        
        return hasMove ? maxScore : evaluateBoard(board, aiIsWhite);
    } else {
        let minScore = Infinity;
        let hasMove = false;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (!piece || piece[0] !== (currentIsWhite ? 'w' : 'b')) continue;
                
                const moves = getValidMovesForPiece(board, row, col);
                moves.forEach(move => {
                    hasMove = true;
                    const newBoard = board.map(r => [...r]);
                    newBoard[row][col] = null;
                    newBoard[move.row][move.col] = piece;
                    
                    const score = minimax(newBoard, depth - 1, true, aiIsWhite);
                    minScore = Math.min(minScore, score);
                });
            }
        }
        
        return hasMove ? minScore : evaluateBoard(board, aiIsWhite);
    }
}