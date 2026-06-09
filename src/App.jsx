import './App.css'
import './components/Board/board.css'
import { initialBoard } from './components/Board/board.js'

import {useState, useEffect} from 'react';
import {isValidMove} from './components/gameLogic/movement.js'
import {isMoveLegal} from './components/gameLogic/check.js'
import {getValidMovesForPiece, getGameStatus } from './components/gameLogic/gameStatus.js'
import {isWhiteTurn, canPlayerMove} from './components/gameLogic/turn.js'
import {getInitialCastlingRights,applyCastleMove, updateCastlingRights} from './components/gameLogic/castling.js'

import GameSetup from './components/gameSetup/gameSetup.jsx';

import Board from './components/Board/Board.jsx';
import GameInfo from './components/gameSetup/gameInfo.jsx';
import {getAIMove} from './components/ai/AI.js';

function App() {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameSettings, setGameSettings] = useState(null);
    const [selected, setSelected] = useState(null);
    const [board, setBoard] = useState(initialBoard);
    const [moveCount, setMoveCount] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [validMoves, setValidMoves] = useState([]);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [castlingRights, setCastlingRights] = useState(getInitialCastlingRights());

    function handleStartGame(settings) {
        setGameSettings(settings);
        setGameStarted(true);
    }

    
    function resetGame() {
        setGameStarted(false);
        setGameSettings(null);
        setSelected(null);
        setBoard(initialBoard);
        setMoveCount(0);
        setGameOver(false);
        setValidMoves([]);
        setIsAIThinking(false);
        setCastlingRights(getInitialCastlingRights());
    }

    function handleClick(row, col) {
        if (gameOver || isAIThinking) return;

        const currentIsWhiteTurn = isWhiteTurn(moveCount);
        const playerIsWhite = gameSettings.playerColor === 'white';
        if (currentIsWhiteTurn !== playerIsWhite) return;

        if (selected == null) {
            const piece = board[row][col];
            if (piece && canPlayerMove(piece, currentIsWhiteTurn)) {
                setSelected({ row, col });
                // Truyền castlingRights vào để tính cả nước nhập thành
                const moves = getValidMovesForPiece(board, row, col, castlingRights);
                setValidMoves(moves);
            }
        } else {
            if (isValidMove(board, selected.row, selected.col, row, col, castlingRights) &&
                isMoveLegal(board, selected.row, selected.col, row, col, currentIsWhiteTurn)) {

                movePiece(selected.row, selected.col, row, col);
                setSelected(null);
                setValidMoves([]);
            } else {
                // Click vào quân cùng màu khác → đổi chọn
                const piece = board[row][col];
                if (piece && canPlayerMove(piece, currentIsWhiteTurn)) {
                    setSelected({ row, col });
                    const moves = getValidMovesForPiece(board, row, col, castlingRights);
                    setValidMoves(moves);
                } else {
                    setSelected(null);
                    setValidMoves([]);
                }
            }
        }
    }

    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        const isKingMove = piece && piece[1] === 'k';
        const isCastling = isKingMove && fromCol === 4 && Math.abs(toCol - fromCol) === 2;

        let newBoard;
        if (isCastling) {
            newBoard = applyCastleMove(board, fromRow, fromCol, toCol);
        } else {
            newBoard = board.map(row => [...row]);
            newBoard[fromRow][fromCol] = null;
            newBoard[toRow][toCol] = piece;
        }

        // Cập nhật quyền nhập thành
        const newRights = updateCastlingRights(castlingRights, fromRow, fromCol, piece);
        setCastlingRights(newRights);

        setBoard(newBoard);
        const newMoveCount = moveCount + 1;
        setMoveCount(newMoveCount);

        const nextIsWhiteTurn = isWhiteTurn(newMoveCount);
        const status = getGameStatus(newBoard, nextIsWhiteTurn, newRights);

        if (status.status === 'checkmate' || status.status === 'stalemate') {
            setGameOver(true);
        }
    }

    useEffect(() => {
        if (gameOver || !gameStarted || !gameSettings) return;

        const currentIsWhiteTurn = isWhiteTurn(moveCount);
        const playerIsWhite = gameSettings.playerColor === 'white';

        if (currentIsWhiteTurn !== playerIsWhite && !isAIThinking) {
            const timer = setTimeout(() => {
                setIsAIThinking(true);
                const aiMove = getAIMove(board, currentIsWhiteTurn, gameSettings.difficulty);

                if (aiMove) {
                    const piece = board[aiMove.from.row][aiMove.from.col];
                    const isKingMove = piece && piece[1] === 'k';
                    const isCastling = isKingMove && aiMove.from.col === 4 && Math.abs(aiMove.to.col - aiMove.from.col) === 2;

                    let newBoard;
                    if (isCastling) {
                        newBoard = applyCastleMove(board, aiMove.from.row, aiMove.from.col, aiMove.to.col);
                    } else {
                        newBoard = board.map(row => [...row]);
                        newBoard[aiMove.from.row][aiMove.from.col] = null;
                        newBoard[aiMove.to.row][aiMove.to.col] = piece;
                    }

                    const newRights = updateCastlingRights(castlingRights, aiMove.from.row, aiMove.from.col, piece);
                    setCastlingRights(newRights);

                    setBoard(newBoard);
                    const newMoveCount = moveCount + 1;
                    setMoveCount(newMoveCount);

                    const nextIsWhiteTurn = isWhiteTurn(newMoveCount);
                    const status = getGameStatus(newBoard, nextIsWhiteTurn, newRights);

                    if (status.status === 'checkmate' || status.status === 'stalemate') {
                        setGameOver(true);
                    }
                }

                setIsAIThinking(false);
            }, 800 + Math.random() * 400);

            return () => clearTimeout(timer);
        }
    }, [moveCount, gameOver, gameStarted, gameSettings]);

    if (!gameStarted) {
        return <GameSetup onStartGame={handleStartGame} />;
    }

    const currentIsWhiteTurn = isWhiteTurn(moveCount);
    const gameStatus = getGameStatus(board, currentIsWhiteTurn, castlingRights);

    return (
        <>
            <GameInfo
                gameStatus={gameStatus}
                gameSettings={gameSettings}
                gameOver={gameOver}
                isAIThinking={isAIThinking}
                resetGame={resetGame}/>
            <Board
                board={board}
                selected={selected}
                validMoves={validMoves}
                onCellClick={handleClick}
                playerIsWhite={gameSettings.playerColor === 'white'}
            />
        </>
    );
}

export default App;