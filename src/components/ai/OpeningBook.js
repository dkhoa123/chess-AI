// ==================== OPENING BOOK ====================
// Key: board position hash → array of weighted moves
// Moves encoded as { from: {row, col}, to: {row, col}, weight }
// Weight affects move selection probability

const OPENING_BOOK = new Map();

// Helper to add opening line
function addLine(moves) {
    // Build up position key from sequence of moves applied to initial board
    // We store by move number + move history key for simplicity
    moves.forEach((_, idx) => {
        const key = moves.slice(0, idx).map(m => `${m.fr}${m.fc}${m.tr}${m.tc}`).join('|');
        if (!OPENING_BOOK.has(key)) {
            OPENING_BOOK.set(key, []);
        }
        const entry = moves[idx];
        OPENING_BOOK.get(key).push({
            from: { row: entry.fr, col: entry.fc },
            to:   { row: entry.tr, col: entry.tc },
            weight: entry.w ?? 10
        });
    });
}

// ---- e4 lines ----
// 1. e4
addLine([{ fr:6,fc:4, tr:4,tc:4, w:20 }]);

// 1. e4 e5
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:3,tc:4 },
]);

// 1. e4 e5 2. Nf3
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:3,tc:4 },
    { fr:7,fc:6, tr:5,tc:5 },
]);

// 1. e4 e5 2. Nf3 Nc6
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:3,tc:4 },
    { fr:7,fc:6, tr:5,tc:5 },
    { fr:0,fc:1, tr:2,tc:2 },
]);

// 1. e4 e5 2. Nf3 Nc6 3. Bb5 (Ruy Lopez)
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:3,tc:4 },
    { fr:7,fc:6, tr:5,tc:5 },
    { fr:0,fc:1, tr:2,tc:2 },
    { fr:7,fc:5, tr:3,tc:1, w:12 },
]);

// 1. e4 e5 2. Nf3 Nc6 3. Bc4 (Italian)
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:3,tc:4 },
    { fr:7,fc:6, tr:5,tc:5 },
    { fr:0,fc:1, tr:2,tc:2 },
    { fr:7,fc:5, tr:4,tc:2, w:10 },
]);

// ---- d4 lines ----
addLine([{ fr:6,fc:3, tr:4,tc:3, w:18 }]);

// 1. d4 d5
addLine([
    { fr:6,fc:3, tr:4,tc:3 },
    { fr:1,fc:3, tr:3,tc:3 },
]);

// 1. d4 d5 2. c4 (Queen's Gambit)
addLine([
    { fr:6,fc:3, tr:4,tc:3 },
    { fr:1,fc:3, tr:3,tc:3 },
    { fr:6,fc:2, tr:4,tc:2, w:15 },
]);

// 1. d4 Nf6 (Indian defenses)
addLine([
    { fr:6,fc:3, tr:4,tc:3 },
    { fr:0,fc:6, tr:2,tc:5 },
]);

// 1. d4 Nf6 2. c4
addLine([
    { fr:6,fc:3, tr:4,tc:3 },
    { fr:0,fc:6, tr:2,tc:5 },
    { fr:6,fc:2, tr:4,tc:2 },
]);

// 1. d4 Nf6 2. c4 e6 3. Nc3 (Nimzo/Queen's Indian)
addLine([
    { fr:6,fc:3, tr:4,tc:3 },
    { fr:0,fc:6, tr:2,tc:5 },
    { fr:6,fc:2, tr:4,tc:2 },
    { fr:1,fc:4, tr:2,tc:4 },
    { fr:7,fc:1, tr:5,tc:2 },
]);

// ---- Nf3 lines ----
addLine([{ fr:7,fc:6, tr:5,tc:5, w:12 }]);

// ---- c4 (English) ----
addLine([{ fr:6,fc:2, tr:4,tc:2, w:10 }]);

// Black responses: Sicilian 1. e4 c5
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:2, tr:3,tc:2, w:15 },
]);

// 1. e4 c5 2. Nf3
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:2, tr:3,tc:2 },
    { fr:7,fc:6, tr:5,tc:5 },
]);

// 1. e4 c5 2. Nf3 d6
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:2, tr:3,tc:2 },
    { fr:7,fc:6, tr:5,tc:5 },
    { fr:1,fc:3, tr:2,tc:3 },
]);

// 1. e4 c5 2. Nf3 d6 3. d4 (Open Sicilian)
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:2, tr:3,tc:2 },
    { fr:7,fc:6, tr:5,tc:5 },
    { fr:1,fc:3, tr:2,tc:3 },
    { fr:6,fc:3, tr:4,tc:3 },
]);

// French Defense: 1. e4 e6
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:2,tc:4, w:10 },
]);

// 1. e4 e6 2. d4 d5
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:4, tr:2,tc:4 },
    { fr:6,fc:3, tr:4,tc:3 },
    { fr:1,fc:3, tr:3,tc:3 },
]);

// Caro-Kann: 1. e4 c6
addLine([
    { fr:6,fc:4, tr:4,tc:4 },
    { fr:1,fc:2, tr:2,tc:2, w:8 },
]);

/**
 * Get a move from opening book given move history
 * @param {Array} moveHistory - array of notation strings (unused, we track by positions)
 * @param {Array} movesPlayed - array of {from,to} objects representing moves played so far
 * @returns {{ from, to } | null}
 */
export function getOpeningBookMove(movesPlayed) {
    const key = movesPlayed.map(m => `${m.from.row}${m.from.col}${m.to.row}${m.to.col}`).join('|');
    const candidates = OPENING_BOOK.get(key);
    if (!candidates || candidates.length === 0) return null;

    // Weighted random selection
    const totalWeight = candidates.reduce((s, c) => s + c.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const c of candidates) {
        rand -= c.weight;
        if (rand <= 0) return { from: c.from, to: c.to };
    }
    return { from: candidates[0].from, to: candidates[0].to };
}