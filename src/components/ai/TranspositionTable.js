// ==================== TRANSPOSITION TABLE ====================
// Stores previously evaluated positions to avoid re-computation

export const TT_FLAG = {
    EXACT: 0,   // Exact score
    LOWER: 1,   // Alpha cutoff (fail-low) → lower bound
    UPPER: 2,   // Beta cutoff (fail-high) → upper bound
};

export class TranspositionTable {
    constructor(sizeMB = 32) {
        // Each entry: ~80 bytes → 32MB ≈ 400K entries
        this.maxSize = Math.floor((sizeMB * 1024 * 1024) / 80);
        this.table = new Map();
        this.hits = 0;
        this.stores = 0;
    }

    /**
     * Generate a lightweight hash key from board state
     * Using board string + turn + castling + enPassant
     */
    static hash(board, isWhiteTurn, castlingRights, enPassantTarget) {
        // Fast board hash: only store non-null pieces
        let h = isWhiteTurn ? '1' : '0';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p) h += `${r}${c}${p}`;
            }
        }
        if (castlingRights) {
            h += (castlingRights.wKing ? 1 : 0)
               + (castlingRights.wRookK ? 1 : 0)
               + (castlingRights.wRookQ ? 1 : 0)
               + (castlingRights.bKing ? 1 : 0)
               + (castlingRights.bRookK ? 1 : 0)
               + (castlingRights.bRookQ ? 1 : 0);
        }
        if (enPassantTarget) h += `e${enPassantTarget.row}${enPassantTarget.col}`;
        return h;
    }

    get(key) {
        const entry = this.table.get(key);
        if (entry) this.hits++;
        return entry ?? null;
    }

    set(key, depth, score, flag, bestMove) {
        // Replacement strategy: replace if new entry has greater depth
        const existing = this.table.get(key);
        if (existing && existing.depth > depth) return;

        // Evict oldest entries if at capacity (simple size cap)
        if (this.table.size >= this.maxSize) {
            // Delete first inserted key
            const firstKey = this.table.keys().next().value;
            this.table.delete(firstKey);
        }

        this.table.set(key, { depth, score, flag, bestMove });
        this.stores++;
    }

    clear() {
        this.table.clear();
        this.hits = 0;
        this.stores = 0;
    }
}