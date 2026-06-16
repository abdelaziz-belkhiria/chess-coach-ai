import React from 'react';
import { useLanguage } from './LanguageProvider';
import { Info, AlertTriangle, Lightbulb } from 'lucide-react';

const CoachPanel = ({ move, selectedPly }) => {
  const { t } = useLanguage();

  if (selectedPly === 0) {
    return (
      <div className="glass-card coach-panel fade-in" style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Info size={24} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem' }}>Game Review Started</h3>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          Welcome to the Game Review! Use the arrows or click on moves to see the analysis and coach comments.
        </p>
      </div>
    );
  }

  if (!move) return null;

  const getExplanation = (cls, bestSan) => {
    switch (cls) {
      case 'Brilliant':
        return "A spectacular find! This move demonstrates a deep understanding of the position or a sharp tactical idea.";
      case 'Great':
        return "An excellent move that significantly improves your position or punishes an opponent's error.";
      case 'Best':
        return "The engine's top choice. You followed the optimal line here.";
      case 'Excellent':
        return "A very strong move that maintains your advantage and follows the core principles of the position.";
      case 'Good':
        return "A solid, playable move. While not the engine's favorite, it's a respectably strong choice.";
      case 'Book':
        return "This is a standard opening move from theory. You're following established chess patterns.";
      case 'Inaccuracy':
        return "A slight slip. This move wasn't optimal and gives some away of your advantage.";
      case 'Mistake':
        return `A clear error. You missed a better continuation. The engine preferred ${bestSan || 'a different approach'}.`;
      case 'Miss':
        return "You missed a critical opportunity to gain a significant advantage or punish your opponent.";
      case 'Blunder':
        return `A costly mistake that significantly worsens your position. The engine recommended ${bestSan || 'a much better move'}.`;
      default:
        return "A standard move. Keep an eye on the evaluation bar to see how the balance shifts.";
    }
  };

  const explanation = getExplanation(move.classification, move.best_move_san);
  const isBad = ['Inaccuracy', 'Mistake', 'Miss', 'Blunder'].includes(move.classification);

  return (
    <div className="glass-card coach-panel fade-in" style={{ 
      borderLeft: `4px solid ${isBad ? 'var(--color-blunder)' : 'var(--color-best)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isBad ? <AlertTriangle size={24} color="var(--color-blunder)" /> : <Lightbulb size={24} color="var(--color-best)" />}
          <h3 style={{ fontSize: '1.2rem' }}>
            {move.move_number}. {move.turn === 'white' ? '' : '... '}{move.move_san}
          </h3>
        </div>
        <div style={{ 
            fontSize: '0.8rem', 
            background: 'var(--bg-card-hover)', 
            padding: '4px 8px', 
            borderRadius: '4px',
            color: 'var(--text-muted)'
        }}>
           Eval: {move.evaluation_after > 0 ? '+' : ''}{move.evaluation_after.toFixed(2)}
        </div>
      </div>

      <p style={{ lineHeight: 1.5 }}>
        {explanation}
      </p>

      {move.best_move_san && move.classification !== 'Best' && (
        <div style={{ 
          marginTop: '8px', 
          padding: '12px', 
          backgroundColor: 'rgba(255,255,255,0.03)', 
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Best move was: </span>
          <span style={{ fontWeight: 600, color: 'var(--color-best)' }}>{move.best_move_san}</span>
          <span style={{ marginLeft: '12px', color: 'var(--color-blunder)' }}>
            (-{move.points_lost.toFixed(2)})
          </span>
        </div>
      )}

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
        * Deterministic explanations for prototype. AI Coach coming soon.
      </div>
    </div>
  );
};

export default CoachPanel;
