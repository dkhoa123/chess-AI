import { useState } from 'react';
import { isValidMove } from '../gameLogic/movement.js';
import { isMoveLegal } from '../gameLogic/check.js';
import { getValidMovesForPiece } from '../gameLogic/gameStatus.js';
import { isWhiteTurn, canPlayerMove } from '../gameLogic/turn.js';

// Hook quản lý click bàn cờ, ô được chọn, valid moves
export function usePlayerInput({ board, moveCount, castlingRights, enPassantTarget, gameOver, isAIThinking, pendingPromotion, playerIsWhite, onMove, onSaveSnapshot }) {
  const [selected, setSelected]     = useState(null);
  const [validMoves, setValidMoves] = useState([]);

  function clearSelection() {
    setSelected(null);
    setValidMoves([]);
  }

  function selectPiece(row, col) {
    const piece = board[row][col];
    if (piece && canPlayerMove(piece, isWhiteTurn(moveCount))) {
      setSelected({ row, col });
      setValidMoves(getValidMovesForPiece(board, row, col, castlingRights, enPassantTarget));
    } else {
      clearSelection();
    }
  }

  function handleCellClick(row, col) {
    if (gameOver || isAIThinking || pendingPromotion) return;

    const currentIsWhiteTurn = isWhiteTurn(moveCount);
    if (currentIsWhiteTurn !== playerIsWhite) return;

    // Chưa chọn quân nào
    if (selected == null) {
      selectPiece(row, col);
      return;
    }

    // Đã chọn quân — thử đi
    const isLegal =
      isValidMove(board, selected.row, selected.col, row, col, castlingRights, enPassantTarget) &&
      isMoveLegal(board, selected.row, selected.col, row, col, currentIsWhiteTurn, enPassantTarget);

    if (isLegal) {
      onSaveSnapshot();
      onMove(selected.row, selected.col, row, col, true);
      clearSelection();
    } else {
      // Click sang quân khác cùng màu → đổi selection
      selectPiece(row, col);
    }
  }

  function reset() { clearSelection(); }

  return { selected, validMoves, handleCellClick, reset };
}