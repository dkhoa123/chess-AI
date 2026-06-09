import {useState } from 'react';

export default function GameSetup({ onStartGame }) {
    const [difficulty, setDifficulty] = useState('easy');
    const [playerColor, setPlayerColor] = useState('white');

    const handleStart = () => {
        onStartGame({ difficulty, playerColor });
    };

    return (
        <div className="game-setup">
            <h2>Cờ Vua - Thiết lập trò chơi</h2>

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
                Bắt đầu trò chơi
            </button>
        </div>
    );
}