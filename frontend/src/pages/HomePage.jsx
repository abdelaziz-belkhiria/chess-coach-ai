import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Import, ArrowRight, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { useLanguage } from '../components/LanguageProvider';

const HomePage = () => {
  const { t } = useLanguage();
  const [platform, setPlatform] = useState('chesscom');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleImport = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const { data } = await api.importLatestGames(username);
      setResult(data);
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page fade-in" style={{ maxWidth: '600px', margin: '60px auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '12px', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('tagline')}</p>
      </header>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Platform Selector */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setPlatform('chesscom')}
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              border: platform === 'chesscom' ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: platform === 'chesscom' ? 'var(--bg-card-hover)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: platform === 'chesscom' ? 'white' : 'var(--text-muted)'
            }}
          >
            {t('chesscom')}
          </button>
          <button 
            disabled
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              opacity: 0.5,
              cursor: 'not-allowed'
            }}
          >
            {t('lichess')}
          </button>
        </div>

        {/* Username Input */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            placeholder={t('username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px 16px 16px 48px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--glass)', 
              border: '1px solid var(--glass-border)', 
              color: 'white',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Action Button */}
        <button 
          onClick={handleImport}
          disabled={loading || !username}
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '12px', 
            backgroundColor: 'var(--primary)', 
            color: 'white',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            opacity: (loading || !username) ? 0.6 : 1,
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
          }}
        >
          {loading ? t('importing') : (
            <>
              <Import size={20} /> {t('import')}
            </>
          )}
        </button>

        {error && <div style={{ color: 'var(--color-blunder)', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

        {result && (
          <div className="fade-in" style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(149, 187, 74, 0.1)', border: '1px solid var(--color-best)', textAlign: 'center' }}>
            <div style={{ fontWeight: 600, color: 'var(--color-best)', marginBottom: '8px' }}>
              {result.imported > 0 
                ? `Successfully imported ${result.imported} new games!` 
                : `0 new games imported (${result.skipped} already existed).`}
            </div>
            <button 
              onClick={() => navigate(`/players/${platform}/${username}/games`)}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--color-best)', color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
            >
              See Games <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
