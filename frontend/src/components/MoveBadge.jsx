import React from 'react';

const MoveBadge = ({ classification }) => {
  if (!classification) return null;

  const styles = {
    Brilliant: { color: 'var(--color-brilliant)', symbol: '!!' },
    Great: { color: 'var(--color-great)', symbol: '!' },
    Best: { color: 'var(--color-best)', symbol: '\u2605' },
    Excellent: { color: 'var(--color-excellent)', symbol: '\u2714' },
    Good: { color: 'var(--color-good)', symbol: '\u2714' },
    Book: { color: 'var(--color-book)', symbol: '\ud83d\udcd6' },
    Inaccuracy: { color: 'var(--color-inaccuracy)', symbol: '?!' },
    Mistake: { color: 'var(--color-mistake)', symbol: '?' },
    Miss: { color: 'var(--color-miss)', symbol: '??' },
    Blunder: { color: 'var(--color-blunder)', symbol: '??' },
  };

  const style = styles[classification] || { color: 'var(--text-muted)', symbol: '' };

  return (
    <span className="move-badge" style={{ 
      backgroundColor: `${style.color}20`, 
      color: style.color,
      border: `1px solid ${style.color}40`
    }}>
      <span style={{ fontSize: '0.9rem' }}>{style.symbol}</span>
      {classification}
    </span>
  );
};

export default MoveBadge;
