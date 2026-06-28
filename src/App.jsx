import './App.css'
import './components/Board/board.css'
import { useState } from 'react';
import { getGameStatus } from './components/gameLogic/gameStatus.js';
import { isWhiteTurn } from './components/gameLogic/turn.js';
import { loadGameState } from './components/gameLogic/moveHistory.js';

import { useGameState }   from './components/hooks/useGameState.js';
import { usePlayerInput } from './components/hooks/usePlayerInput.js';
import { useAIMove }      from './components/hooks/useAIMove.js';

import GameSetup        from './components/gameSetup/gameSetup.jsx';
import Board            from './components/Board/Board.jsx';
import TopBar           from './components/ui/TopBar.jsx';
import BoardWithCoords  from './components/ui/BoardWithCoords.jsx';
import MoveHistoryPanel from './components/gameSetup/MoveHistoryPanel.jsx';
import ConfirmDialog    from './components/ui/ConfirmDialog.jsx';
import PromotionModal   from './components/gameLogic/PromotionModal.jsx';

export default function App() {
  const game = useGameState();
  const [confirmDialog, setConfirmDialog] = useState(null);

  const playerIsWhite = game.gameSettings?.playerColor === 'white';

  const { isAIThinking } = useAIMove({
    board: game.board,
    moveCount: game.moveCount,
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    gameOver: game.gameOver,
    gameStarted: game.gameStarted,
    gameSettings: game.gameSettings,
    pendingPromotion: game.pendingPromotion,
    onMove: game.makeMove,
  });

  const input = usePlayerInput({
    board: game.board,
    moveCount: game.moveCount,
    castlingRights: game.castlingRights,
    enPassantTarget: game.enPassantTarget,
    gameOver: game.gameOver,
    isAIThinking,
    pendingPromotion: game.pendingPromotion,
    playerIsWhite,
    onMove: game.makeMove,
    onSaveSnapshot: game.saveSnapshotForUndo,
  });

  function handleExitToLobby() {
    setConfirmDialog({
      message: 'Thoát về sảnh?\nTiến trình sẽ được lưu để tiếp tục sau.',
      onConfirm: () => { setConfirmDialog(null); game.exitToLobby(); input.reset(); },
    });
  }

  // ---------- Sảnh ----------
  if (!game.gameStarted) {
    return (
      <GameSetup
        onStartGame={game.startGame}
        hasSavedGame={!!loadGameState()}
        onContinue={() => window.location.reload()}
      />
    );
  }

  const currentIsWhiteTurn = isWhiteTurn(game.moveCount);
  const gameStatus = getGameStatus(
    game.board,
    currentIsWhiteTurn,
    game.castlingRights,
    game.enPassantTarget,
    game.positionCounts,
    game.halfmoveClock
  );
  const canUndo = game.boardHistory.length > 0 && !isAIThinking && !game.gameOver;

  return (
    <>
      <style>{`@keyframes chessSpin { to { transform: rotate(360deg); } }`}</style>

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      <div style={pageStyle}>
        <TopBar
          gameSettings={game.gameSettings}
          gameStatus={gameStatus}
          isAIThinking={isAIThinking}
          gameOver={game.gameOver}
          onReset={game.resetGame}
          onExit={handleExitToLobby}
        />

        <div style={mainAreaStyle}>
          <BoardWithCoords playerIsWhite={playerIsWhite}>
            <Board
              board={game.board}
              selected={input.selected}
              validMoves={input.validMoves}
              onCellClick={input.handleCellClick}
              playerIsWhite={playerIsWhite}
              enPassantTarget={game.enPassantTarget}
            />
          </BoardWithCoords>

          <MoveHistoryPanel
            history={game.moveHistory}
            onUndo={game.undoMove}
            onExitToLobby={handleExitToLobby}
            onReset={game.resetGame}
            canUndo={canUndo}
            gameOver={game.gameOver}
          />
        </div>
      </div>

      {game.pendingPromotion && (
        <PromotionModal
          isWhite={game.pendingPromotion.isWhite}
          onSelect={game.confirmPromotion}
        />
      )}
    </>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  gap: '14px',
  boxSizing: 'border-box',
};

const mainAreaStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
};