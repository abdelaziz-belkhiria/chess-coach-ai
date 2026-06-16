import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

const GameCard = ({ game, onAnalyze, analyzing }) => {
  const { t } = useLanguage();

  return (
    <div className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600 }}>{game.white_username}</span>
            <span style={{ color: 'var(--text-muted)' }}>vs</span>
            <span style={{ fontWeight: 600 }}>{game.black_username}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {game.time_control}s • {new Date(game.end_time).toLocaleDateString()}
          </div>
        </div>
        {game.analyzed ? (
          <div style={{ color: 'var(--color-best)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
            <CheckCircle size={14} /> Analyzed
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
            <AlertCircle size={14} /> Pending
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', gap: '12px' }}>
        {!game.analyzed ? (
          <button 
            onClick={() => onAnalyze(game.id)}
            disabled={analyzing}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--primary)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: analyzing ? 0.6 : 1
            }}
          >
            {analyzing ? t('analyzing') : (
              <>
                <Search size={16} /> {t('analyze')}
              </>
            )}
          </button>
        ) : (
          <Link 
            to={`/games/${game.id}/review`}
            style={{ 
              flex: 1, 
              padding: '10px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--secondary)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Play size={16} /> {t('review')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default GameCard;
