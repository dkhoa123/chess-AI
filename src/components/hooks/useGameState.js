import { useState, useEffect } from 'react';
import { initialBoard } from '../Board/board.js';
import { isKingInCheck } from '../gameLogic/check.js';
import { getGameStatus } from '../gameLogic/gameStatus.js';
import { isWhiteTurn } from '../gameLogic/turn.js';
import { getInitialCastlingRights, applyCastleMove, updateCastlingRights } from '../gameLogic/castling.js';
import { formatMove, saveGameState, loadGameState, clearGameState } from '../gameLogic/moveHistory.js';

function getEmptyState() {
  return {
    board: initialBoard,
    moveCount: 0,
    castlingRights: getInitialCastlingRights(),
    moveHistory: [],
    boardHistory: [],
  };
}

// Tách logic di chuyển quân thuần túy (không phụ thuộc React state)
export function applyMove(board, castlingRights, moveHistory, moveCount, fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  const isKingMove = piece[1] === 'k';
  const isCastling = isKingMove && fromCol === 4 && Math.abs(toCol - fromCol) === 2;
  const isCapture = !!board[toRow][toCol];

  let newBoard;
  if (isCastling) {
    newBoard = applyCastleMove(board, fromRow, fromCol, toCol);
  } else {
    newBoard = board.map(r => [...r]);
    newBoard[fromRow][fromCol] = null;
    newBoard[toRow][toCol] = piece;
  }

  const newRights = updateCastlingRights(castlingRights, fromRow, fromCol, piece);
  const isCheck = isKingInCheck(newBoard, !isWhiteTurn(moveCount));
  const notation = formatMove(piece, fromRow, fromCol, toRow, toCol, isCapture, isCheck, isCastling);

  const isPawn = piece[1] === 'p';
  const isWhitePiece = piece[0] === 'w';
  const isPromotion = isPawn && ((isWhitePiece && toRow === 0) || (!isWhitePiece && toRow === 7));

  return { newBoard, newRights, notation, isPawn, isWhitePiece, isPromotion, isCastling };
}

// ==================== HOOK CHÍNH ====================
export function useGameState() {
  const [gameStarted, setGameStarted]       = useState(false);
  const [gameSettings, setGameSettings]     = useState(null);
  const [board, setBoard]                   = useState(initialBoard);
  const [moveCount, setMoveCount]           = useState(0);
  const [castlingRights, setCastlingRights] = useState(getInitialCastlingRights());
  const [moveHistory, setMoveHistory]       = useState([]);
  const [boardHistory, setBoardHistory]     = useState([]);
  const [gameOver, setGameOver]             = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState(null);

  // ---------- Load saved state ----------
  useEffect(() => {
    const saved = loadGameState();
    if (!saved) return;
    setGameSettings(saved.gameSettings);
    setBoard(saved.board);
    setMoveCount(saved.moveCount);
    setCastlingRights(saved.castlingRights);
    setMoveHistory(saved.moveHistory);
    setBoardHistory(saved.boardHistory);
    setGameOver(saved.gameOver);
    setGameStarted(true);
  }, []);

  // ---------- Auto-save ----------
  useEffect(() => {
    if (!gameStarted || !gameSettings) return;
    saveGameState({ gameSettings, board, moveCount, castlingRights, moveHistory, boardHistory, gameOver });
  }, [board, moveCount, gameOver]);

  // ---------- Helpers ----------
  function commitBoard(newBoard, newRights, newHistory, newMoveCount) {
    setBoard(newBoard);
    setCastlingRights(newRights);
    setMoveHistory(newHistory);
    setMoveCount(newMoveCount);
    const st = getGameStatus(newBoard, isWhiteTurn(newMoveCount), newRights);
    if (st.status === 'checkmate' || st.status === 'stalemate') setGameOver(true);
  }

  // ---------- Actions ----------
  function startGame(settings) {
    const e = getEmptyState();
    setGameSettings(settings);
    setGameStarted(true);
    setBoard(e.board);
    setMoveCount(e.moveCount);
    setCastlingRights(e.castlingRights);
    setMoveHistory(e.moveHistory);
    setBoardHistory(e.boardHistory);
    setGameOver(false);
    setPendingPromotion(null);
    clearGameState();
  }

  function resetGame() { startGame(gameSettings); }

  function exitToLobby() {
    // State đã auto-save, chỉ cần reset UI về sảnh
    setGameStarted(false);
    setPendingPromotion(null);
  }

  function undoMove() {
    if (boardHistory.length === 0) return;
    const snap = boardHistory[boardHistory.length - 1];
    setBoard(snap.board);
    setMoveCount(snap.moveCount);
    setCastlingRights(snap.castlingRights);
    setMoveHistory(snap.moveHistory);
    setBoardHistory(prev => prev.slice(0, -1));
    setGameOver(false);
  }

  function makeMove(fromRow, fromCol, toRow, toCol, isPlayerMove = false) {
    const { newBoard, newRights, notation, isWhitePiece, isPromotion } =
      applyMove(board, castlingRights, moveHistory, moveCount, fromRow, fromCol, toRow, toCol);

    const newHistory = [...moveHistory, notation];
    const newMoveCount = moveCount + 1;

    if (isPromotion) {
      // Cập nhật board tạm, chờ người dùng chọn quân
      setBoard(newBoard);
      setCastlingRights(newRights);
      setMoveHistory(newHistory);
      setMoveCount(newMoveCount);

      if (isPlayerMove) {
        setPendingPromotion({ row: toRow, col: toCol, isWhite: isWhitePiece, newBoard, newRights, newHistory, newMoveCount });
      } else {
        // AI tự phong hậu
        const pb = newBoard.map(r => [...r]);
        pb[toRow][toCol] = (isWhitePiece ? 'w' : 'b') + 'q';
        setBoard(pb);
        const st = getGameStatus(pb, isWhiteTurn(newMoveCount), newRights);
        if (st.status === 'checkmate' || st.status === 'stalemate') setGameOver(true);
      }
      return;
    }

    commitBoard(newBoard, newRights, newHistory, newMoveCount);
  }

  function confirmPromotion(pieceType) {
    if (!pendingPromotion) return;
    const { row, col, isWhite, newBoard, newRights, newHistory, newMoveCount } = pendingPromotion;
    const pb = newBoard.map(r => [...r]);
    pb[row][col] = (isWhite ? 'w' : 'b') + pieceType;
    setPendingPromotion(null);
    commitBoard(pb, newRights, newHistory, newMoveCount);
  }

  function saveSnapshotForUndo() {
    setBoardHistory(prev => [...prev, { board, moveCount, castlingRights, moveHistory }]);
  }

  return {
    // state
    gameStarted, gameSettings, board, moveCount, castlingRights,
    moveHistory, boardHistory, gameOver, pendingPromotion,
    // actions
    startGame, resetGame, exitToLobby, undoMove,
    makeMove, confirmPromotion, saveSnapshotForUndo,
  };
}