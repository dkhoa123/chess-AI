// ==================== ENHANCED ALPHA-BETA WITH ALL UPGRADES ====================
import { evaluateBoard, CHECKMATE_SCORE } from './EvaluateBoard.js';
import { getValidMovesForPiece } from '../gameLogic/gameStatus.js';
import { isKingInCheck } from '../gameLogic/check.js';
import { simulateMove } from './aiMoveHelpers.js';
import { TranspositionTable, TT_FLAG } from './TranspositionTable.js';
import { orderMoves, getAllMovesForSide } from './MoveOrdering.js';
import { quiescence } from './QuiescenceSearch.js';

// Shared transposition table (persists between moves for same game)
const TT = new TranspositionTable(32);

// Killer moves: [ply][0..1] = move key that caused beta cutoff
const MAX_DEPTH = 8;
const killerMoves = Array.from({ length: MAX_DEPTH + 2 }, () => [null, null]);

// History heuristic table: pieceType+toSquare → score
const historyTable = {};

/**
 * Reset search state for new move (not new game)
 */
function resetSearchState() {
    // Reset killers but keep TT and history (they remain useful)
    for (let i = 0; i < killerMoves.length; i++) killerMoves[i] = [null, null];
}

/**
 * Store killer move
 */
function addKillerMove(ply, fromRow, fromCol, toRow, toCol) {
    const key = `${fromRow}${fromCol}${toRow}${toCol}`;
    if (killerMoves[ply][0] !== key) {
        killerMoves[ply][1] = killerMoves[ply][0];
        killerMoves[ply][0] = key;
    }
}

/**
 * Update history heuristic
 */
function updateHistory(board, fromRow, fromCol, toRow, toCol, depth) {
    const piece = board[fromRow][fromCol];
    if (!piece) return;
    const hKey = `${piece[1]}${toRow}${toCol}`;
    historyTable[hKey] = (historyTable[hKey] ?? 0) + depth * depth;
}

// ==================== ALPHA-BETA WITH ALL FEATURES ====================
function alphaBetaEnhanced(board, depth, alpha, beta, isMaximizing, aiIsWhite, enPassantTarget, ply, castlingRights) {
    const currentIsWhite = isMaximizing ? aiIsWhite : !aiIsWhite;

    // --- Transposition Table lookup ---
    const ttKey = TranspositionTable.hash(board, currentIsWhite, castlingRights, enPassantTarget);
    const ttEntry = TT.get(ttKey);
    let ttBestMove = null;

    if (ttEntry && ttEntry.depth >= depth) {
        const { score, flag } = ttEntry;
        if (flag === TT_FLAG.EXACT) return score;
        if (flag === TT_FLAG.LOWER && score >= beta) return score;
        if (flag === TT_FLAG.UPPER && score <= alpha) return score;
        ttBestMove = ttEntry.bestMove;
    } else if (ttEntry) {
        ttBestMove = ttEntry.bestMove;
    }

    // --- Quiescence at leaf ---
    if (depth <= 0) {
        return quiescence(board, alpha, beta, isMaximizing, aiIsWhite, enPassantTarget);
    }

    // --- Generate and order moves ---
    const allMoves = getAllMovesForSide(board, currentIsWhite, castlingRights, enPassantTarget, getValidMovesForPiece);

    // Terminal: no moves = checkmate or stalemate
    if (allMoves.length === 0) {
        if (isKingInCheck(board, currentIsWhite)) {
            // Checkmate: score based on distance to root (prefer faster mates)
            const mateScore = CHECKMATE_SCORE - ply;
            return isMaximizing ? -mateScore : mateScore;
        }
        return 0; // Stalemate
    }

    // Order moves
    const ordered = orderMoves(
        board,
        allMoves.map(m => m.move),
        allMoves.map(m => ({ fromRow: m.fromRow, fromCol: m.fromCol })),
        enPassantTarget,
        killerMoves,
        historyTable,
        ply,
        ttBestMove
    );

    let bestMove = null;
    let originalAlpha = alpha;

    if (isMaximizing) {
        let maxScore = -Infinity;

        for (const { fromRow, fromCol, move } of ordered) {
            const { newBoard, newEnPassantTarget } = simulateMove(board, fromRow, fromCol, move.row, move.col, enPassantTarget);

            // Handle promotion (assume queen)
            const piece = board[fromRow][fromCol];
            if (piece && piece[1] === 'p' && (move.row === 0 || move.row === 7)) {
                newBoard[move.row][move.col] = (currentIsWhite ? 'w' : 'b') + 'q';
            }

            const score = alphaBetaEnhanced(newBoard, depth - 1, alpha, beta, false, aiIsWhite, newEnPassantTarget, ply + 1, null);

            if (score > maxScore) {
                maxScore = score;
                bestMove = { from: { row: fromRow, col: fromCol }, to: move };
            }

            if (score > alpha) alpha = score;

            if (beta <= alpha) {
                // Beta cutoff: store killer + history
                const isQuiet = board[move.row][move.col] === null;
                if (isQuiet) {
                    addKillerMove(ply, fromRow, fromCol, move.row, move.col);
                    updateHistory(board, fromRow, fromCol, move.row, move.col, depth);
                }
                TT.set(ttKey, depth, maxScore, TT_FLAG.LOWER, bestMove);
                return maxScore;
            }
        }

        const flag = maxScore <= originalAlpha ? TT_FLAG.UPPER : (maxScore >= beta ? TT_FLAG.LOWER : TT_FLAG.EXACT);
        TT.set(ttKey, depth, maxScore, flag, bestMove);
        return maxScore;

    } else {
        let minScore = Infinity;

        for (const { fromRow, fromCol, move } of ordered) {
            const { newBoard, newEnPassantTarget } = simulateMove(board, fromRow, fromCol, move.row, move.col, enPassantTarget);

            const piece = board[fromRow][fromCol];
            if (piece && piece[1] === 'p' && (move.row === 0 || move.row === 7)) {
                newBoard[move.row][move.col] = (currentIsWhite ? 'w' : 'b') + 'q';
            }

            const score = alphaBetaEnhanced(newBoard, depth - 1, alpha, beta, true, aiIsWhite, newEnPassantTarget, ply + 1, null);

            if (score < minScore) {
                minScore = score;
                bestMove = { from: { row: fromRow, col: fromCol }, to: move };
            }

            if (score < beta) beta = score;

            if (beta <= alpha) {
                const isQuiet = board[move.row][move.col] === null;
                if (isQuiet) {
                    addKillerMove(ply, fromRow, fromCol, move.row, move.col);
                    updateHistory(board, fromRow, fromCol, move.row, move.col, depth);
                }
                TT.set(ttKey, depth, minScore, TT_FLAG.LOWER, bestMove);
                return minScore;
            }
        }

        const flag = minScore >= beta ? TT_FLAG.LOWER : (minScore <= alpha ? TT_FLAG.UPPER : TT_FLAG.EXACT);
        TT.set(ttKey, depth, minScore, flag, bestMove);
        return minScore;
    }
}

// ==================== ITERATIVE DEEPENING ====================
/**
 * Iterative deepening: search depth 1..maxDepth, using each iteration's
 * best move to seed move ordering for the next. Returns best move found.
 */
export function getAlphaBetaAIMove(board, isWhite, maxDepth = 4, castlingRights, enPassantTarget) {
    resetSearchState();

    let bestMove = null;
    let bestScore = -Infinity;

    // Iterative deepening loop
    for (let depth = 1; depth <= maxDepth; depth++) {
        let depthBestMove = null;
        let depthBestScore = -Infinity;
        let alpha = -Infinity;
        let beta = Infinity;

        // Get all moves for current side
        const allMoves = getAllMovesForSide(board, isWhite, castlingRights, enPassantTarget, getValidMovesForPiece);

        if (allMoves.length === 0) return null;

        // Order moves using TT best move from previous iteration
        const ttKey = TranspositionTable.hash(board, isWhite, castlingRights, enPassantTarget);
        const ttEntry = TT.get(ttKey);
        const ttBestMove = ttEntry?.bestMove ?? bestMove;

        const ordered = orderMoves(
            board,
            allMoves.map(m => m.move),
            allMoves.map(m => ({ fromRow: m.fromRow, fromCol: m.fromCol })),
            enPassantTarget,
            killerMoves,
            historyTable,
            0,
            ttBestMove
        );

        for (const { fromRow, fromCol, move } of ordered) {
            const { newBoard, newEnPassantTarget } = simulateMove(board, fromRow, fromCol, move.row, move.col, enPassantTarget);

            // Handle promotion
            const piece = board[fromRow][fromCol];
            if (piece && piece[1] === 'p' && (move.row === 0 || move.row === 7)) {
                newBoard[move.row][move.col] = (isWhite ? 'w' : 'b') + 'q';
            }

            const score = alphaBetaEnhanced(newBoard, depth - 1, alpha, beta, false, isWhite, newEnPassantTarget, 1, null);

            if (score > depthBestScore) {
                depthBestScore = score;
                depthBestMove = { from: { row: fromRow, col: fromCol }, to: move };
                alpha = Math.max(alpha, score);
            }
        }

        // Only update best if we completed this depth
        if (depthBestMove) {
            bestMove = depthBestMove;
            bestScore = depthBestScore;

            // Store root position in TT
            TT.set(ttKey, depth, bestScore, TT_FLAG.EXACT, bestMove);

            // Early exit on found mate
            if (bestScore >= CHECKMATE_SCORE - MAX_DEPTH) break;
        }
    }

    return bestMove;
}

// Export TT for potential clearing between games
export { TT as transpositionTable };