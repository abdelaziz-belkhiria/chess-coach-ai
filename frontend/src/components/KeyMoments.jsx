import React from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import MoveBadge from './MoveBadge';

const KeyMoments = ({ moments, onSelect }) => {
  const { t } = useLanguage();

  if (!moments || moments.length === 0) return null;

  return (
    <div className="glass-card">
      <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={20} color="#f0c15c" /> {t('keyMoments')}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {moments.map((m, idx) => (
          <div 
            key={idx} 
            onClick={() => onSelect(m)}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              padding: '12px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Move {m.move_number} • {m.turn}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{m.move_san}</span>
              <MoveBadge classification={m.classification} />
            </div>
            <div style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--color-blunder)' }}>
              -{m.points_lost} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyMoments;
