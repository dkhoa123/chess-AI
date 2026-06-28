// ==================== MOVE ORDERING ====================
// Orders moves to maximize alpha-beta cutoffs
// Priority: captures (MVV-LVA) > killer moves > history heuristic > quiet moves

// Most Valuable Victim - Least Valuable Attacker table
const MVV_LVA_VALUES = { p: 1, n: 2, b: 3, r: 4, q: 5, k: 6 };

/**
 * Score a single move for ordering purposes
 * Higher score = try earlier (more likely to cause cutoff)
 */
export function scoreMoveForOrdering(board, fromRow, fromCol, toRow, toCol, enPassantTarget, killerMoves, historyTable, ply) {
    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];
    const pieceType = piece[1];
    let score = 0;

    // 1. Captures: MVV-LVA (Most Valuable Victim / Least Valuable Attacker)
    if (target) {
        const victimVal = MVV_LVA_VALUES[target[1]] ?? 0;
        const attackerVal = MVV_LVA_VALUES[pieceType] ?? 6;
        score += 10000 + victimVal * 10 - attackerVal;
    }

    // 2. En passant capture
    const isEnPassant = pieceType === 'p' && enPassantTarget &&
        toRow === enPassantTarget.row && toCol === enPassantTarget.col &&
        fromCol !== toCol && board[toRow][toCol] === null;
    if (isEnPassant) score += 9000; // slightly below pawn capture

    // 3. Promotions (Queen)
    const isWhite = piece[0] === 'w';
    if (pieceType === 'p' && (toRow === 0 || toRow === 7)) {
        score += 8000;
    }

    // 4. Killer moves (quiet moves that caused beta cutoff at this ply)
    if (score === 0 && killerMoves && killerMoves[ply]) {
        const [k1, k2] = killerMoves[ply];
        const moveKey = `${fromRow}${fromCol}${toRow}${toCol}`;
        if (k1 === moveKey) score += 7000;
        else if (k2 === moveKey) score += 6000;
    }

    // 5. History heuristic (quiet moves that historically caused cutoffs)
    if (score === 0 && historyTable) {
        const hKey = `${pieceType}${toRow}${toCol}`;
        score += (historyTable[hKey] ?? 0);
    }

    return score;
}

/**
 * Sort moves by score (descending) for alpha-beta ordering
 */
export function orderMoves(board, moves, fromPositions, enPassantTarget, killerMoves, historyTable, ply, ttBestMove) {
    const scored = moves.map((move, i) => {
        const { fromRow, fromCol } = fromPositions[i];
        let s = scoreMoveForOrdering(board, fromRow, fromCol, move.row, move.col, enPassantTarget, killerMoves, historyTable, ply);

        // TT best move gets highest priority
        if (ttBestMove &&
            ttBestMove.from.row === fromRow && ttBestMove.from.col === fromCol &&
            ttBestMove.to.row === move.row   && ttBestMove.to.col === move.col) {
            s += 100000;
        }

        return { move, fromRow, fromCol, score: s };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
}

/**
 * Collect all moves for a side with their origins
 */
export function getAllMovesForSide(board, isWhite, castlingRights, enPassantTarget, getValidMovesForPiece) {
    const result = [];
    const color = isWhite ? 'w' : 'b';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece || piece[0] !== color) continue;
            const moves = getValidMovesForPiece(board, r, c, castlingRights, enPassantTarget);
            for (const m of moves) {
                result.push({ fromRow: r, fromCol: c, move: m });
            }
        }
    }
    return result;
}