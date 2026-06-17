import React, { useEffect } from 'react';

const getSymbol = (cls) => {
  switch (cls) {
    case 'Brilliant': return '!!';
    case 'Great': return '!';
    case 'Inaccuracy': return '?!';
    case 'Mistake': return '?';
    case 'Miss': return 'X';
    case 'Blunder': return '??';
    default: return '';
  }
};

const MoveItem = ({ move, active, onClick }) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 12px',
        cursor: 'pointer',
        backgroundColor: active ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
        borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: '0.1s'
      }}
    >
      <span style={{ fontWeight: 600 }}>{move.move_san}</span>
      {move.classification && move.classification !== 'Best' && <span style={{ fontSize: '0.7rem' }}>{getSymbol(move.classification)}</span>}
    </div>
  );
};

const MoveList = ({ moves, currentPly, onSelectPly }) => {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {pairs.map((pair, idx) => (
        <div key={idx} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ width: '40px', padding: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
            {idx + 1}.
          </div>
          <MoveItem move={pair[0]} active={currentPly === idx * 2 + 1} onClick={() => onSelectPly(idx * 2 + 1)} />
          {pair[1] && <MoveItem move={pair[1]} active={currentPly === idx * 2 + 2} onClick={() => onSelectPly(idx * 2 + 2)} />}
        </div>
      ))}
    </div>
  );
};

export default MoveList;
