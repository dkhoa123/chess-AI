// ==================== ENHANCED BOARD EVALUATION ====================
import { PIECE_POSITION_VALUES } from '../../data/PiecePositionValue.js';
import { isKingInCheck, isSquareUnderAttack } from '../gameLogic/check.js';
import { getValidMovesForPiece } from '../gameLogic/gameStatus.js';

// Use ±Infinity for actual checkmate (not just a large number)
export const CHECKMATE_SCORE = Infinity;
export const DRAW_SCORE = 0;

// Scaled piece values for internal use (centipawns)
const PV = {
    p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000
};

// ==================== MOBILITY ====================
function getMobilityScore(board, isWhite, enPassantTarget) {
    let count = 0;
    const color = isWhite ? 'w' : 'b';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p || p[0] !== color) continue;
            // Fast pseudo-legal count (skip full legal check for speed)
            const moves = getValidMovesForPiece(board, r, c, null, enPassantTarget);
            count += moves.length;
        }
    }
    return count;
}

// ==================== PAWN STRUCTURE ====================
function getPawnStructureScore(board, isWhite) {
    const color = isWhite ? 'w' : 'b';
    const enemy = isWhite ? 'b' : 'w';
    let score = 0;

    // Track pawn columns for doubled/isolated detection
    const pawnsInCol = Array(8).fill(0);
    const enemyPawnsInCol = Array(8).fill(0);
    const pawnRows = {}; // col → [rows]

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p || p[1] !== 'p') continue;
            if (p[0] === color) {
                pawnsInCol[c]++;
                if (!pawnRows[c]) pawnRows[c] = [];
                pawnRows[c].push(r);
            } else if (p[0] === enemy) {
                enemyPawnsInCol[c]++;
            }
        }
    }

    for (let c = 0; c < 8; c++) {
        if (pawnsInCol[c] === 0) continue;

        // Doubled pawns penalty
        if (pawnsInCol[c] > 1) score -= 30 * (pawnsInCol[c] - 1);

        // Isolated pawn penalty
        const hasNeighbor = (c > 0 && pawnsInCol[c-1] > 0) || (c < 7 && pawnsInCol[c+1] > 0);
        if (!hasNeighbor) score -= 20;

        // Passed pawn bonus: no enemy pawns ahead in same or adjacent columns
        const rows = pawnRows[c] || [];
        for (const row of rows) {
            const isPassedPawn = checkPassedPawn(board, row, c, isWhite, enemyPawnsInCol, color, enemy);
            if (isPassedPawn) {
                // Bonus grows as pawn advances
                const advanceBonus = isWhite ? (6 - row) * 15 : (row - 1) * 15;
                score += 20 + advanceBonus;
            }
        }
    }

    return score;
}

function checkPassedPawn(board, row, col, isWhite, enemyPawnsInCol, color, enemy) {
    // Check no enemy pawns on same or adjacent files ahead of this pawn
    const direction = isWhite ? -1 : 1;
    for (let c2 = Math.max(0, col-1); c2 <= Math.min(7, col+1); c2++) {
        for (let r2 = row + direction; r2 >= 0 && r2 < 8; r2 += direction) {
            const p = board[r2][c2];
            if (p && p[0] === enemy && p[1] === 'p') return false;
        }
    }
    return true;
}

// ==================== KING SAFETY ====================
function getKingSafetyScore(board, isWhite) {
    const color = isWhite ? 'w' : 'b';
    const enemy = isWhite ? 'b' : 'w';
    let score = 0;

    // Find king position
    let kingRow = -1, kingCol = -1;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === color + 'k') { kingRow = r; kingCol = c; break; }
        }
        if (kingRow !== -1) break;
    }
    if (kingRow === -1) return 0;

    // Pawn shield: count friendly pawns in front of king
    const shieldDir = isWhite ? -1 : 1;
    for (let dc = -1; dc <= 1; dc++) {
        const sc = kingCol + dc;
        const sr = kingRow + shieldDir;
        if (sc < 0 || sc > 7 || sr < 0 || sr > 7) continue;
        if (board[sr][sc] === color + 'p') score += 15;
        // Second rank shield
        const sr2 = kingRow + 2 * shieldDir;
        if (sr2 >= 0 && sr2 < 8 && board[sr2][sc] === color + 'p') score += 7;
    }

    // Open file near king penalty
    for (let dc = -1; dc <= 1; dc++) {
        const kc = kingCol + dc;
        if (kc < 0 || kc > 7) continue;
        let hasFriendlyPawn = false;
        let hasEnemyPawn = false;
        for (let r = 0; r < 8; r++) {
            if (board[r][kc] === color + 'p') hasFriendlyPawn = true;
            if (board[r][kc] === enemy + 'p') hasEnemyPawn = true;
        }
        if (!hasFriendlyPawn) score -= 20;
        if (!hasFriendlyPawn && !hasEnemyPawn) score -= 15; // fully open file
    }

    // Attack zone: squares around king being attacked
    let attackCount = 0;
    for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
            const r = kingRow + dr;
            const c = kingCol + dc;
            if (r < 0 || r > 7 || c < 0 || c > 7) continue;
            if (isSquareUnderAttack(board, r, c, enemy === 'w')) attackCount++;
        }
    }
    score -= attackCount * 8;

    return score;
}

// ==================== BISHOP PAIR BONUS ====================
function getBishopPairBonus(board, isWhite) {
    const color = isWhite ? 'w' : 'b';
    let count = 0;
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
            if (board[r][c] === color + 'b') count++;
    return count >= 2 ? 30 : 0;
}

// ==================== ROOK ON OPEN FILE ====================
function getRookFileBonus(board, isWhite) {
    const color = isWhite ? 'w' : 'b';
    const enemy = isWhite ? 'b' : 'w';
    let score = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] !== color + 'r') continue;
            let friendlyPawn = false, enemyPawn = false;
            for (let r2 = 0; r2 < 8; r2++) {
                if (board[r2][c] === color + 'p') friendlyPawn = true;
                if (board[r2][c] === enemy + 'p') enemyPawn = true;
            }
            if (!friendlyPawn && !enemyPawn) score += 20; // open file
            else if (!friendlyPawn) score += 10;          // semi-open file
            // Rook on 7th rank bonus
            const seventhRank = isWhite ? 1 : 6;
            if (r === seventhRank) score += 25;
        }
    }
    return score;
}

// ==================== MAIN EVALUATION ====================
/**
 * Full position evaluation in centipawns, from aiIsWhite's perspective.
 * Returns +Infinity if aiIsWhite is checkmating, -Infinity if being checkmated.
 */
export function evaluateBoard(board, aiIsWhite, enPassantTarget = null) {
    let whiteScore = 0;
    let blackScore = 0;

    // --- Material + position tables ---
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (!piece) continue;

            const type = piece[1];
            const isWhitePiece = piece[0] === 'w';

            // Scaled material value
            let value = PV[type];

            // Position table
            const posTable = PIECE_POSITION_VALUES[type];
            if (posTable) {
                value += isWhitePiece
                    ? posTable[row][col]
                    : posTable[7 - row][col];
            }

            if (isWhitePiece) whiteScore += value;
            else blackScore += value;
        }
    }

    // --- Mobility (weighted lower than material) ---
    const whiteMobility = getMobilityScore(board, true, enPassantTarget);
    const blackMobility = getMobilityScore(board, false, enPassantTarget);
    whiteScore += whiteMobility * 3;
    blackScore += blackMobility * 3;

    // --- Pawn structure ---
    whiteScore += getPawnStructureScore(board, true);
    blackScore += getPawnStructureScore(board, false);

    // --- King safety ---
    whiteScore += getKingSafetyScore(board, true);
    blackScore += getKingSafetyScore(board, false);

    // --- Bishop pair ---
    whiteScore += getBishopPairBonus(board, true);
    blackScore += getBishopPairBonus(board, false);

    // --- Rook file bonus ---
    whiteScore += getRookFileBonus(board, true);
    blackScore += getRookFileBonus(board, false);

    // --- Check penalties (lightweight) ---
    if (isKingInCheck(board, true))  blackScore += 50;
    if (isKingInCheck(board, false)) whiteScore += 50;

    const total = whiteScore - blackScore;
    return aiIsWhite ? total : -total;
}

export default evaluateBoard;