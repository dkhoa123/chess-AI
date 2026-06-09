
import { isSquareUnderAttack} from '../gameLogic/check.js'
import {getValidMovesForPiece} from '../gameLogic/gameStatus.js'
import { PIECE_VALUES } from '../../data/Piecevalue.js'

// ==================== MATERIAL-BASED AI (Dễ) ====================
export function getMaterialAIMove(board, isWhite) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece || piece[0] !== (isWhite ? 'w' : 'b')) continue;
            
            const moves = getValidMovesForPiece(board, row, col);
            moves.forEach(move => {
                const score = evaluateMaterialMove(board, row, col, move.row, move.col);
                const randomFactor = (Math.random() - 0.5) * 0.5;
                const totalScore = score + randomFactor;
                
                if (totalScore > bestScore) {
                    bestScore = totalScore;
                    bestMove = { from: { row, col }, to: move };
                }
            });
        }
    }
    
    return bestMove;
}

function evaluateMaterialMove(board, fromRow, fromCol, toRow, toCol) {
    let score = 0;
    const targetPiece = board[toRow][toCol];
    const movingPiece = board[fromRow][fromCol];
    
    if (targetPiece) {
        score += PIECE_VALUES[targetPiece[1]] * 10;
    }
    
    const testBoard = board.map(r => [...r]);
    testBoard[fromRow][fromCol] = null;
    testBoard[toRow][toCol] = movingPiece;
    
    if (isSquareUnderAttack(testBoard, toRow, toCol, movingPiece[0] !== 'w')) {
        score -= PIECE_VALUES[movingPiece[1]] * 10;
    }
    
    return score;
}