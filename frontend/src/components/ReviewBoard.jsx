import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ReviewBoard = ({ pgn, moves, currentPly }) => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');

  const [lastMoveSquares, setLastMoveSquares] = useState({});

  useEffect(() => {
    try {
      const newGame = new Chess();
      if (!pgn) return;

      newGame.loadPgn(pgn);
      const history = newGame.history({ verbose: true });
      
      const tempGame = new Chess();
      let success = true;
      let lastMove = null;
      
      for (let i = 0; i < currentPly && i < history.length; i++) {
        try {
          lastMove = history[i];
          tempGame.move(history[i].san);
        } catch (e) {
          success = false;
          break;
        }
      }
      
      if (success) {
        setGame(tempGame);
        if (lastMove) {
          setLastMoveSquares({
            [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
            [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
          });
        } else {
          setLastMoveSquares({});
        }
      } else {
        // Fallback to FEN if replay fails
        const moveData = moves?.[currentPly - 1];
        if (moveData?.fen_before) {
          const fallbackGame = new Chess();
          fallbackGame.load(moveData.fen_before);
          try {
            fallbackGame.move(moveData.move_san);
            setGame(fallbackGame);
          } catch (e) {
            setGame(fallbackGame);
          }
        }
        setLastMoveSquares({});
      }
    } catch (err) {
      console.error("Board replay error:", err);
    }
  }, [pgn, moves, currentPly]);

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Chessboard 
        position={game.fen()} 
        boardOrientation={boardOrientation}
        customSquareStyles={lastMoveSquares}
        customDarkSquareStyle={{ backgroundColor: '#779556' }}
        customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
      />
      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="glass-card" 
          onClick={() => setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white')}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Flip Board
        </button>
      </div>
    </div>
  );
};

export default ReviewBoard;
