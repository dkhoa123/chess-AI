export default function GameInfo({
    gameStatus,
    gameSettings,
    gameOver,
    isAIThinking,
    resetGame
}) {
    return (
<div className="game-info">
                <h1>♟️ Cờ Vua ♟️</h1>
                <p className={`difficulty-badge ${gameSettings.difficulty}`}>
                    Độ khó: {gameSettings.difficulty === 'easy' ? '⭐ Dễ' : gameSettings.difficulty === 'medium' ? '⭐⭐ Trung bình' : '⭐⭐⭐ Khó'}
                </p>
                {isAIThinking && <p className="ai-thinking">🤖 AI đang suy nghĩ...</p>}
                <p className={
                    gameStatus.status === 'check' ? 'check-warning' :
                    gameStatus.status === 'checkmate' ? 'checkmate-warning' :
                    gameStatus.status === 'stalemate' ? 'stalemate-warning' : ''
                }>
                    {gameStatus.message}
                </p>
                {gameOver && (
                    <button onClick={resetGame}>🔄 Chơi lại</button>
                )}
            </div>
    );
}