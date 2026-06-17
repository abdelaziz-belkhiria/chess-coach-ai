import React, { useMemo, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const HIGHLIGHT_STYLE = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };

// Computes the board position + last-move highlight for a given ply directly from
// the backend-provided per-move data (fen_before + move_san), instead of replaying
// the entire raw PGN every time. This is more robust: each move only ever needs to
// apply ONE already-validated SAN move on top of an already-validated FEN, both of
// which were produced by python-chess on the backend, so it can't desync from the
// real game and doesn't depend on chess.com's raw annotated PGN text being present.
function resolvePosition(moves, currentPly) {
  if (!moves || moves.length === 0 || currentPly <= 0) {
    return { fen: STARTING_FEN, squareStyles: {} };
  }

  const move = moves[currentPly - 1];
  if (!move?.fen_before || !move?.move_san) {
    return { fen: STARTING_FEN, squareStyles: {} };
  }

  try {
    const chess = new Chess(move.fen_before);
    const verbose = chess.move(move.move_san);
    return {
      fen: chess.fen(),
      squareStyles: verbose
        ? { [verbose.from]: HIGHLIGHT_STYLE, [verbose.to]: HIGHLIGHT_STYLE }
        : {},
    };
  } catch (err) {
    // Never let a single bad move crash the page - fall back to the raw position
    // we know is valid (the position right before this move was played).
    console.error('Board replay error, falling back to fen_before:', err);
    return { fen: move.fen_before, squareStyles: {} };
  }
}

const ReviewBoard = ({ moves, currentPly }) => {
  const [boardOrientation, setBoardOrientation] = useState('white');

  const { fen, squareStyles } = useMemo(
    () => resolvePosition(moves, currentPly),
    [moves, currentPly]
  );

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <Chessboard
        options={{
          position: fen,
          boardOrientation,
          squareStyles,
          darkSquareStyle: { backgroundColor: '#779556' },
          lightSquareStyle: { backgroundColor: '#ebecd0' },
          allowDragging: false,
          showAnimations: true,
          animationDurationInMs: 200,
        }}
      />
      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
        <button
          className="glass-card"
          onClick={() => setBoardOrientation((o) => (o === 'white' ? 'black' : 'white'))}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Flip Board
        </button>
      </div>
    </div>
  );
};

export default ReviewBoard;
