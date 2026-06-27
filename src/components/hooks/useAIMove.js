import { useEffect, useState } from 'react';
import { isWhiteTurn } from '../gameLogic/turn.js';
import { getAIMove } from '../ai/AI.js';

// Hook kích hoạt AI đi khi đến lượt
export function useAIMove({ board, moveCount, castlingRights, gameOver, gameStarted, gameSettings, pendingPromotion, onMove }) {
  const [isAIThinking, setIsAIThinking] = useState(false);

  useEffect(() => {
    if (gameOver || !gameStarted || !gameSettings || pendingPromotion) return;

    const currentIsWhiteTurn = isWhiteTurn(moveCount);
    const playerIsWhite = gameSettings.playerColor === 'white';
    if (currentIsWhiteTurn === playerIsWhite || isAIThinking) return;

    const timer = setTimeout(() => {
      setIsAIThinking(true);
      const aiMove = getAIMove(board, currentIsWhiteTurn, gameSettings.difficulty);
      if (aiMove) {
        onMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col, false);
      }
      setIsAIThinking(false);
    }, 800 + Math.random() * 400);

    return () => clearTimeout(timer);
  }, [moveCount, gameOver, gameStarted, gameSettings, pendingPromotion]);

  return { isAIThinking };
}