import { PIECE_VALUES } from '../../data/Piecevalue.js'
import { isKingInCheck } from '../gameLogic/check.js'

import { PIECE_POSITION_VALUES } from '../../data/PiecePositionValue.js'
// ==================== BOARD EVALUATION ====================
export function evaluateBoard(board, aiIsWhite) {
    let whiteScore = 0;
    let blackScore = 0;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece) continue;
            
            const pieceType = piece[1];
            const isWhitePiece = piece[0] === 'w';
            
            let value = PIECE_VALUES[pieceType];
            
            const posValue = PIECE_POSITION_VALUES[pieceType];
            if (isWhitePiece) {
                value += posValue[row][col];
            } else {
                value += posValue[7 - row][col];
            }
            
            if (isWhitePiece) {
                whiteScore += value;
            } else {
                blackScore += value;
            }
        }
    }
    
    const whiteInCheck = isKingInCheck(board, true);
    const blackInCheck = isKingInCheck(board, false);
    
    if (whiteInCheck) blackScore += 50;
    if (blackInCheck) whiteScore += 50;
    
    const totalScore = whiteScore - blackScore;
    return aiIsWhite ? totalScore : -totalScore;
}

export default evaluateBoard;