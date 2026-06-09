export function isWhiteTurn(moveCount) {
    return moveCount % 2 === 0;
}

export function canPlayerMove(piece, isWhiteTurn) {
    if (!piece) return false;
    const pieceColor = piece[0];
    return (isWhiteTurn && pieceColor === 'w') || (!isWhiteTurn && pieceColor === 'b');
}