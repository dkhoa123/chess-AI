// ==================== AI DISPATCHER ====================
import { getMaterialAIMove } from './MaterialAI.js';
import { getMinimaxAIMove } from './MinimaxAI.js';
import { getAlphaBetaAIMove, transpositionTable } from './AlphabetaPrunding.js';
import { getOpeningBookMove } from './OpeningBook.js';

// Track moves played this game for opening book lookup
// Keyed by a game ID derived from initial position
let gameMoveLog = [];  // Array of { from, to }
let lastBoardHash = null;

/**
 * Call this when a new game starts to reset opening book state
 */
export function resetAIGameState() {
    gameMoveLog = [];
    lastBoardHash = null;
    transpositionTable.clear();
}

/**
 * Record a move for opening book tracking (call after every move, human or AI)
 */
export function recordMoveForBook(from, to) {
    gameMoveLog.push({ from, to });
}

// ==================== GET AI MOVE BASED ON DIFFICULTY ====================
export function getAIMove(board, isWhite, difficulty, castlingRights, enPassantTarget) {
    switch (difficulty) {
        case 'easy':
            return getMaterialAIMove(board, isWhite, castlingRights, enPassantTarget);

        case 'medium':
            return getMinimaxAIMove(board, isWhite, 3, castlingRights, enPassantTarget);

        case 'hard': {
            // 1. Try opening book first (first 10 moves = 20 half-moves)
            if (gameMoveLog.length < 20) {
                const bookMove = getOpeningBookMove(gameMoveLog);
                if (bookMove) {
                    // Validate the book move is legal on current board
                    const { from, to } = bookMove;
                    if (
                        from.row >= 0 && from.row < 8 &&
                        from.col >= 0 && from.col < 8 &&
                        board[from.row][from.col] &&
                        board[from.row][from.col][0] === (isWhite ? 'w' : 'b')
                    ) {
                        return bookMove;
                    }
                }
            }

            // 2. Alpha-beta with iterative deepening (depth 4 = actual search depth 4 + quiescence)
            return getAlphaBetaAIMove(board, isWhite, 4, castlingRights, enPassantTarget);
        }

        default:
            return getMaterialAIMove(board, isWhite, castlingRights, enPassantTarget);
    }
}