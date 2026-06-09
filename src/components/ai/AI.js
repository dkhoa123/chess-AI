import { getMaterialAIMove } from './MaterialAI.js'
import { getMinimaxAIMove } from './MinimaxAI.js'
import { getAlphaBetaAIMove } from './AlphabetaPrunding.js'


// ==================== GET AI MOVE BASED ON DIFFICULTY ====================
export function getAIMove(board, isWhite, difficulty) {
    switch(difficulty) {
        case 'easy':
            return getMaterialAIMove(board, isWhite);
        case 'medium':
            return getMinimaxAIMove(board, isWhite, 3);
        case 'hard':
            return getAlphaBetaAIMove(board, isWhite, 4);
        default:
            return getMaterialAIMove(board, isWhite);
    }
}
