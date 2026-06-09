import {evaluateBoard} from './EvaluateBoard.js'
import {getValidMovesForPiece} from '../gameLogic/gameStatus.js'
// ==================== ALPHA-BETA PRUNING (Khó) ====================
export function getAlphaBetaAIMove(board, isWhite, depth = 4) {
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
                
                const score = alphaBeta(newBoard, depth - 1, -Infinity, Infinity, false, isWhite);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from: { row, col }, to: move };
                }
            });
        }
    }
    
    return bestMove;
}

function alphaBeta(board, depth, alpha, beta, isMaximizing, aiIsWhite) {
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
                for (let move of moves) {
                    hasMove = true;
                    const newBoard = board.map(r => [...r]);
                    newBoard[row][col] = null;
                    newBoard[move.row][move.col] = piece;
                    
                    const score = alphaBeta(newBoard, depth - 1, alpha, beta, false, aiIsWhite);
                    maxScore = Math.max(maxScore, score);
                    alpha = Math.max(alpha, score);
                    
                    if (beta <= alpha) {
                        return maxScore;
                    }
                }
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
                for (let move of moves) {
                    hasMove = true;
                    const newBoard = board.map(r => [...r]);
                    newBoard[row][col] = null;
                    newBoard[move.row][move.col] = piece;
                    
                    const score = alphaBeta(newBoard, depth - 1, alpha, beta, true, aiIsWhite);
                    minScore = Math.min(minScore, score);
                    beta = Math.min(beta, score);
                    
                    if (beta <= alpha) {
                        return minScore;
                    }
                }
            }
        }
        
        return hasMove ? minScore : evaluateBoard(board, aiIsWhite);
    }
}