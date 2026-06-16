import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Target, ChevronLeft, LayoutGrid, List as ListIcon } from 'lucide-react';
import { api } from '../api/client';
import { useLanguage } from '../components/LanguageProvider';
import GameCard from '../components/GameCard';

const GamesPage = () => {
  const { username, platform } = useParams();
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => {
    fetchGames();
  }, [username]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const { data } = await api.getPlayerGames(username);
      setGames(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (gameId) => {
    setAnalyzingId(gameId);
    try {
      await api.analyzeGame(gameId);
      // Wait a bit or just refetch
      fetchGames();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="games-page fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
            <ChevronLeft size={16} /> Home
          </Link>
          <h2 style={{ fontSize: '2rem' }}>{t('games')} for {username}</h2>
        </div>
        <Link 
          to={`/players/${platform}/${username}/weaknesses`}
          style={{ 
            padding: '12px 24px', 
            borderRadius: '12px', 
            background: 'linear-gradient(to right, var(--primary), var(--secondary))', 
            color: 'white', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Target size={20} /> {t('weaknesses')}
        </Link>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>{t('loading')}</div>
      ) : games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>{t('noGames')}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {[...games].sort((a, b) => {
            const dateA = a.end_time ? new Date(a.end_time).getTime() : 0;
            const dateB = b.end_time ? new Date(b.end_time).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            return (b.id || 0) - (a.id || 0);
          }).map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onAnalyze={handleAnalyze} 
              analyzing={analyzingId === game.id} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesPage;
