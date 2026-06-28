import pieceImages from '../../pieceimg.js'

export default function Board({ board, selected, validMoves, onCellClick, playerIsWhite, enPassantTarget }) {
    return (
        <div className="board">
            {Array.from({ length: 8 }, (_, i) => playerIsWhite ? i : 7 - i).map(rowIndex =>
                Array.from({ length: 8 }, (_, j) => playerIsWhite ? j : 7 - j).map(colIndex => {
                    const isValid = validMoves.some(
                      move => move.row === rowIndex && move.col === colIndex
                      );
                    // Nước bắt tốt qua đường: ô đích trống nhưng vẫn là một nước bắt quân
                    const isEnPassantCapture = !!(
                        selected &&
                        enPassantTarget &&
                        enPassantTarget.row === rowIndex &&
                        enPassantTarget.col === colIndex &&
                        board[selected.row]?.[selected.col]?.[1] === 'p' &&
                        selected.col !== colIndex
                    );
                    const isCapture = (isValid && board[rowIndex][colIndex] !== null) || (isValid && isEnPassantCapture);
                    const piece = board[rowIndex][colIndex];
                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                             className={`square
                                   ${(rowIndex + colIndex) % 2 === 0 ? "white" : "black"}
                                   ${selected && selected.row === rowIndex && selected.col === colIndex ? "selected" : ""}
                                   ${isValid && !isCapture ? "valid-move" : ""}
                                   ${isCapture ? "valid-capture" : ""}  // 👈 class riêng
                                          `}
                              onClick={() => onCellClick(rowIndex, colIndex)}
                            >
                            {piece && (
                                <img src={pieceImages[piece]} width="50" height="50" alt="" />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}