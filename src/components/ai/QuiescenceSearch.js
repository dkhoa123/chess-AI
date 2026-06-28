// ==================== QUIESCENCE SEARCH ====================
// Extends search at leaf nodes to resolve tactical sequences
// Only considers captures and promotions to avoid horizon effect

import { evaluateBoard, CHECKMATE_SCORE } from './EvaluateBoard.js';
import { getValidMovesForPiece } from '../gameLogic/gameStatus.js';
import { simulateMove } from './aiMoveHelpers.js';
import { isKingInCheck } from '../gameLogic/check.js';

const MAX_Q_DEPTH = 6; // Max quiescence depth to avoid explosion

/**
 * Quiescence search: only look at captures/promotions
 * Returns score from aiIsWhite's perspective
 */
export function quiescence(board, alpha, beta, isMaximizing, aiIsWhite, enPassantTarget, qDepth = 0) {
    // Stand-pat score: assume we can choose not to capture
    const standPat = evaluateBoard(board, aiIsWhite, enPassantTarget);

    if (qDepth >= MAX_Q_DEPTH) return standPat;

    const currentIsWhite = isMaximizing ? aiIsWhite : !aiIsWhite;
    const color = currentIsWhite ? 'w' : 'b';

    if (isMaximizing) {
        if (standPat >= beta) return beta;    // Beta cutoff
        if (standPat > alpha) alpha = standPat;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece || piece[0] !== color) continue;

                const moves = getValidMovesForPiece(board, r, c, null, enPassantTarget);
                for (const move of moves) {
                    // Only captures and promotions
                    const isCapture = board[move.row][move.col] !== null;
                    const isPromotion = piece[1] === 'p' && (move.row === 0 || move.row === 7);
                    const isEnPassant = piece[1] === 'p' && enPassantTarget &&
                        move.row === enPassantTarget.row && move.col === enPassantTarget.col &&
                        c !== move.col && board[move.row][move.col] === null;

                    if (!isCapture && !isPromotion && !isEnPassant) continue;

                    const { newBoard, newEnPassantTarget } = simulateMove(board, r, c, move.row, move.col, enPassantTarget);

                    // If promotion, assume queen
                    if (isPromotion) {
                        newBoard[move.row][move.col] = (currentIsWhite ? 'w' : 'b') + 'q';
                    }

                    const score = quiescence(newBoard, alpha, beta, false, aiIsWhite, newEnPassantTarget, qDepth + 1);

                    if (score >= beta) return beta;
                    if (score > alpha) alpha = score;
                }
            }
        }
        return alpha;

    } else {
        if (standPat <= alpha) return alpha;  // Alpha cutoff
        if (standPat < beta) beta = standPat;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (!piece || piece[0] !== color) continue;

                const moves = getValidMovesForPiece(board, r, c, null, enPassantTarget);
                for (const move of moves) {
                    const isCapture = board[move.row][move.col] !== null;
                    const isPromotion = piece[1] === 'p' && (move.row === 0 || move.row === 7);
                    const isEnPassant = piece[1] === 'p' && enPassantTarget &&
                        move.row === enPassantTarget.row && move.col === enPassantTarget.col &&
                        c !== move.col && board[move.row][move.col] === null;

                    if (!isCapture && !isPromotion && !isEnPassant) continue;

                    const { newBoard, newEnPassantTarget } = simulateMove(board, r, c, move.row, move.col, enPassantTarget);

                    if (isPromotion) {
                        newBoard[move.row][move.col] = (currentIsWhite ? 'w' : 'b') + 'q';
                    }

                    const score = quiescence(newBoard, alpha, beta, true, aiIsWhite, newEnPassantTarget, qDepth + 1);

                    if (score <= alpha) return alpha;
                    if (score < beta) beta = score;
                }
            }
        }
        return beta;
    }
}