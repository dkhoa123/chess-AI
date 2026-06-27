// ==================== MOVE HISTORY UTILITIES ====================

export const PIECE_NAMES = {
  p: '', r: 'X', n: 'M', b: 'T', q: 'H', k: 'V'
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function formatMove(piece, fromRow, fromCol, toRow, toCol, isCapture, isCheck, isCastling) {
  if (isCastling) {
    return toCol === 6 ? 'O-O' : 'O-O-O';
  }
  const pieceName = PIECE_NAMES[piece[1]];
  const from = FILES[fromCol] + (8 - fromRow);
  const to = FILES[toCol] + (8 - toRow);
  const capture = isCapture ? 'x' : '-';
  const check = isCheck ? '+' : '';
  return `${pieceName}${from}${capture}${to}${check}`;
}

// ==================== LOCAL STORAGE ====================

const STORAGE_KEY = 'chess_game_state';

export function saveGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Không thể lưu trạng thái:', e);
  }
}

export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}