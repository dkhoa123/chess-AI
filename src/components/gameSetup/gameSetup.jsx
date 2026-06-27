import { useState } from 'react';

export default function GameSetup({ onStartGame, hasSavedGame, onContinue }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [playerColor, setPlayerColor] = useState('white');

  const handleStart = () => {
    onStartGame({ difficulty, playerColor });
  };

  return (
    <div className="game-setup">
      <h2>♟️ Cờ Vua</h2>

      {hasSavedGame && (
        <div style={styles.savedBanner}>
          <span>💾 Bạn có ván cờ chưa hoàn thành</span>
          <button style={styles.continueBtn} onClick={onContinue}>
            ▶ Tiếp tục chơi
          </button>
        </div>
      )}

      <div className="setup-section">
        <h3>Chọn độ khó:</h3>
        <div className="difficulty-buttons">
          {['easy', 'medium', 'hard'].map(level => (
            <button
              key={level}
              className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
              onClick={() => setDifficulty(level)}
            >
              {level === 'easy' ? '⭐ Dễ' : level === 'medium' ? '⭐⭐ Trung bình' : '⭐⭐⭐ Khó'}
            </button>
          ))}
        </div>
      </div>

      <div className="setup-section">
        <h3>Chọn quân:</h3>
        <div className="color-buttons">
          {['white', 'black'].map(color => (
            <button
              key={color}
              className={`color-btn ${playerColor === color ? 'active' : ''}`}
              onClick={() => setPlayerColor(color)}
            >
              {color === 'white' ? '⚪ Trắng' : '⚫ Đen'}
            </button>
          ))}
        </div>
      </div>

      <button className="start-btn" onClick={handleStart}>
        {hasSavedGame ? '🆕 Ván mới' : 'Bắt đầu trò chơi'}
      </button>
    </div>
  );
}

const styles = {
  savedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(255,215,0,0.15)',
    border: '1px solid rgba(255,215,0,0.4)',
    borderRadius: '10px',
    padding: '12px 20px',
    marginBottom: '10px',
    fontSize: '15px',
    color: '#fff',
  },
  continueBtn: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
  },
};