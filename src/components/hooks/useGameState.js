import { useState, useEffect } from 'react';
import { initialBoard } from '../Board/board.js';
import { isKingInCheck } from '../gameLogic/check.js';
import { getGameStatus, getPositionKey } from '../gameLogic/gameStatus.js';
import { isWhiteTurn } from '../gameLogic/turn.js';
import { getInitialCastlingRights, applyCastleMove, updateCastlingRights } from '../gameLogic/castling.js';
import { getEnPassantCapturedSquare } from '../gameLogic/movement.js';
import { formatMove, saveGameState, loadGameState, clearGameState } from '../gameLogic/moveHistory.js';
import { resetAIGameState, recordMoveForBook } from '../ai/AI.js';

function getEmptyState() {
  const board = initialBoard;
  return {
    board,
    moveCount: 0,
    castlingRights: getInitialCastlingRights(),
    moveHistory: [],
    boardHistory: [],
    enPassantTarget: null,
    halfmoveClock: 0,
    positionCounts: { [getPositionKey(board, true, getInitialCastlingRights(), null)]: 1 },
  };
}

// Tách logic di chuyển quân thuần túy (không phụ thuộc React state)
// enPassantTarget: ô bắt tốt qua đường hợp lệ TRƯỚC khi thực hiện nước đi này
export function applyMove(board, castlingRights, moveHistory, moveCount, fromRow, fromCol, toRow, toCol, enPassantTarget) {
  const piece = board[fromRow][fromCol];
  const isWhitePiece = piece[0] === 'w';
  const isKingMove = piece[1] === 'k';
  const isPawn = piece[1] === 'p';
  const isCastling = isKingMove && fromCol === 4 && Math.abs(toCol - fromCol) === 2;

  // Phát hiện bắt tốt qua đường: tốt đi chéo vào đúng ô enPassantTarget, ô đích trống
  const isEnPassantCapture = isPawn &&
    enPassantTarget &&
    toRow === enPassantTarget.row &&
    toCol === enPassantTarget.col &&
    fromCol !== toCol &&
    board[toRow][toCol] === null;

  const isCapture = !!board[toRow][toCol] || isEnPassantCapture;

  let newBoard;
  if (isCastling) {
    newBoard = applyCastleMove(board, fromRow, fromCol, toCol);
  } else if (isEnPassantCapture) {
    newBoard = board.map(r => [...r]);
    const { row: capRow, col: capCol } = getEnPassantCapturedSquare(toRow, toCol, isWhitePiece);
    newBoard[capRow][capCol] = null; // xóa quân tốt bị bắt qua đường
    newBoard[fromRow][fromCol] = null;
    newBoard[toRow][toCol] = piece;
  } else {
    newBoard = board.map(r => [...r]);
    newBoard[fromRow][fromCol] = null;
    newBoard[toRow][toCol] = piece;
  }

  const newRights = updateCastlingRights(castlingRights, fromRow, fromCol, piece);
  const isCheck = isKingInCheck(newBoard, !isWhiteTurn(moveCount));
  const notation = formatMove(piece, fromRow, fromCol, toRow, toCol, isCapture, isCheck, isCastling);

  const isPromotion = isPawn && ((isWhitePiece && toRow === 0) || (!isWhitePiece && toRow === 7));

  // Tính ô en passant mới: nếu tốt vừa đi 2 ô, ô "đi qua" trở thành mục tiêu bắt qua đường cho lượt sau
  let newEnPassantTarget = null;
  if (isPawn && Math.abs(toRow - fromRow) === 2) {
    newEnPassantTarget = { row: (fromRow + toRow) / 2, col: fromCol };
  }

  // Reset halfmove clock khi có bắt quân hoặc đi tốt, ngược lại tăng lên
  const resetsHalfmove = isPawn || isCapture;

  return {
    newBoard, newRights, notation, isPawn, isWhitePiece, isPromotion, isCastling,
    isCapture, newEnPassantTarget, resetsHalfmove,
  };
}

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
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [halfmoveClock, setHalfmoveClock]     = useState(0);
  const [positionCounts, setPositionCounts]   = useState({});

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
    setEnPassantTarget(saved.enPassantTarget ?? null);
    setHalfmoveClock(saved.halfmoveClock ?? 0);
    setPositionCounts(saved.positionCounts ?? {});
    setGameStarted(true);
  }, []);

  // ---------- Auto-save ----------
  useEffect(() => {
    if (!gameStarted || !gameSettings) return;
    saveGameState({
      gameSettings, board, moveCount, castlingRights, moveHistory, boardHistory,
      gameOver, enPassantTarget, halfmoveClock, positionCounts,
    });
  }, [board, moveCount, gameOver]);

  // ---------- Helpers ----------
  function commitBoard(newBoard, newRights, newHistory, newMoveCount, newEnPassantTarget, newHalfmoveClock) {
    setBoard(newBoard);
    setCastlingRights(newRights);
    setMoveHistory(newHistory);
    setMoveCount(newMoveCount);
    setEnPassantTarget(newEnPassantTarget);
    setHalfmoveClock(newHalfmoveClock);

    const nextIsWhiteTurn = isWhiteTurn(newMoveCount);
    const key = getPositionKey(newBoard, nextIsWhiteTurn, newRights, newEnPassantTarget);
    const newCounts = { ...positionCounts, [key]: (positionCounts[key] ?? 0) + 1 };
    setPositionCounts(newCounts);

    const st = getGameStatus(newBoard, nextIsWhiteTurn, newRights, newEnPassantTarget, newCounts, newHalfmoveClock);
    if (
      st.status === 'checkmate' ||
      st.status === 'stalemate' ||
      st.status === 'insufficient_material' ||
      st.status === 'fifty_move' ||
      st.status === 'threefold_repetition'
    ) {
      setGameOver(true);
    }
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
    setEnPassantTarget(e.enPassantTarget);
    setHalfmoveClock(e.halfmoveClock);
    setPositionCounts(e.positionCounts);
    clearGameState();
    resetAIGameState();
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
    setEnPassantTarget(snap.enPassantTarget ?? null);
    setHalfmoveClock(snap.halfmoveClock ?? 0);
    setPositionCounts(snap.positionCounts ?? {});
    setBoardHistory(prev => prev.slice(0, -1));
    setGameOver(false);
  }

  function makeMove(fromRow, fromCol, toRow, toCol, isPlayerMove = false) {
    const {
      newBoard, newRights, notation, isWhitePiece, isPromotion,
      newEnPassantTarget, resetsHalfmove,
    } = applyMove(board, castlingRights, moveHistory, moveCount, fromRow, fromCol, toRow, toCol, enPassantTarget);

    const newHistory = [...moveHistory, notation];
    const newMoveCount = moveCount + 1;
    const newHalfmoveClock = resetsHalfmove ? 0 : halfmoveClock + 1;

    if (isPromotion) {
      // Cập nhật board tạm, chờ người dùng chọn quân
      setBoard(newBoard);
      setCastlingRights(newRights);
      setMoveHistory(newHistory);
      setMoveCount(newMoveCount);
      setEnPassantTarget(newEnPassantTarget);
      setHalfmoveClock(newHalfmoveClock);

      if (isPlayerMove) {
        setPendingPromotion({
          row: toRow, col: toCol, isWhite: isWhitePiece, newBoard, newRights,
          newHistory, newMoveCount, newEnPassantTarget, newHalfmoveClock,
        });
      } else {
        // AI tự phong hậu
        const pb = newBoard.map(r => [...r]);
        pb[toRow][toCol] = (isWhitePiece ? 'w' : 'b') + 'q';
        commitBoard(pb, newRights, newHistory, newMoveCount, newEnPassantTarget, newHalfmoveClock);
      }
      return;
    }

    recordMoveForBook({ row: fromRow, col: fromCol }, { row: toRow, col: toCol });
    commitBoard(newBoard, newRights, newHistory, newMoveCount, newEnPassantTarget, newHalfmoveClock);
  }

  function confirmPromotion(pieceType) {
    if (!pendingPromotion) return;
    const {
      row, col, isWhite, newBoard, newRights, newHistory, newMoveCount,
      newEnPassantTarget, newHalfmoveClock,
    } = pendingPromotion;
    const pb = newBoard.map(r => [...r]);
    pb[row][col] = (isWhite ? 'w' : 'b') + pieceType;
    setPendingPromotion(null);
    commitBoard(pb, newRights, newHistory, newMoveCount, newEnPassantTarget, newHalfmoveClock);
  }

  function saveSnapshotForUndo() {
    setBoardHistory(prev => [...prev, {
      board, moveCount, castlingRights, moveHistory,
      enPassantTarget, halfmoveClock, positionCounts,
    }]);
  }

  return {
    // state
    gameStarted, gameSettings, board, moveCount, castlingRights,
    moveHistory, boardHistory, gameOver, pendingPromotion,
    enPassantTarget, halfmoveClock, positionCounts,
    // actions
    startGame, resetGame, exitToLobby, undoMove,
    makeMove, confirmPromotion, saveSnapshotForUndo,
  };
}