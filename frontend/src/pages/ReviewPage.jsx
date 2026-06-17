import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Target, AlertCircle, List as ListIcon, Rewind, FastForward, ChevronRight, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { api } from '../api/client';
import { useLanguage } from '../components/LanguageProvider';
import ReviewBoard from '../components/ReviewBoard';
import EvaluationChart from '../components/EvaluationChart';
import MoveBadge from '../components/MoveBadge';
import KeyMoments from '../components/KeyMoments';
import CoachPanel from '../components/CoachPanel';
import MoveList from '../components/MoveList';


const ReviewPage = () => {
  const { gameId } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPly, setCurrentPly] = useState(0);

  const fetchReview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.getGameReview(gameId);
      setData(data);
      if (data?.moves?.length > 0) setCurrentPly(0); // Start at beginning
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        setError("unanalyzed");
      } else {
        setError(t('error'));
      }
    } finally {
      setLoading(false);
    }
  }, [gameId, t]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setCurrentPly(prev => Math.min(prev + 1, data?.moves?.length || 0));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPly(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await api.analyzeGame(gameId);
      fetchReview();
    } catch (err) {
      setError(t('error'));
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><div className="fade-in">{t('loading')}</div></div>;

  if (error === "unanalyzed") {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <h3 style={{ marginBottom: '16px' }}>Game not analyzed yet</h3>
        <button 
          onClick={handleAnalyze}
          style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px' }}
        >
          {t('analyze')}
        </button>
      </div>
    );
  }

  if (error || !data) return <div style={{ textAlign: 'center', padding: '100px' }}>{error || t('error')}</div>;

  const { game, summary, moves, evaluation_graph, key_moments } = data;
  const currentMove = currentPly > 0 ? moves[currentPly - 1] : null;

  return (
    <div className="review-page fade-in">
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ChevronLeft size={16} /> {t('backToGames')}
          </button>
          <h2 style={{ fontSize: '1.8rem' }}>
            {game.white_username} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1.2rem' }}>vs</span> {game.black_username}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{game.result} • {game.time_control}s</div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
             <AccuracyDisplay platform="white" accuracy={summary.white?.accuracy_estimate || 0} username={game.white_username} />
             <AccuracyDisplay platform="black" accuracy={summary.black?.accuracy_estimate || 0} username={game.black_username} />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px', alignItems: 'start' }}>
        {/* Left: Board and Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ReviewBoard moves={moves} currentPly={currentPly} />
            
            {/* Navigation Controls */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <NavButton onClick={() => setCurrentPly(0)} disabled={currentPly === 0} icon={<Rewind size={20} />} />
              <NavButton onClick={() => setCurrentPly(prev => prev - 1)} disabled={currentPly === 0} icon={<ChevronLeftIcon size={20} />} />
              <NavButton onClick={() => setCurrentPly(prev => prev + 1)} disabled={currentPly === moves.length} icon={<ChevronRight size={20} />} />
              <NavButton onClick={() => setCurrentPly(moves.length)} disabled={currentPly === moves.length} icon={<FastForward size={20} />} />
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
              <Target size={18} /> Evaluation
            </h3>
            <EvaluationChart data={evaluation_graph} currentPly={currentPly} onSelectPly={setCurrentPly} />
          </div>

          <KeyMoments moments={key_moments} onSelect={(m) => setCurrentPly(m.ply || m.move_number * 2 - (m.turn === 'white' ? 1 : 0))} />
        </div>

        {/* Right: Coach, Breakdown, Moves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CoachPanel move={currentMove} selectedPly={currentPly} />

          <div className="glass-card" style={{ padding: '16px' }}>
             <h4 style={{ marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Move Breakdown</h4>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {Object.entries(summary.white?.counts || {}).filter(([label, count]) => count > 0 || (summary.black?.counts?.[label] || 0) > 0).map(([label, count]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                    <MoveBadge classification={label} />
                    <span style={{ fontWeight: 600 }}>{count} | {summary.black?.counts?.[label] || 0}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="glass-card" style={{ flex: 1, height: '500px', display: 'flex', flexDirection: 'column', padding: 0 }}>
             <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListIcon size={18} /> <h4 style={{ fontSize: '1rem' }}>{t('moves')}</h4>
             </div>
             <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                <MoveList moves={moves} currentPly={currentPly} onSelectPly={setCurrentPly} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ onClick, disabled, icon }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className="glass-card"
    style={{ 
      padding: '10px 20px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity: disabled ? 0.3 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: '0.2s',
      borderRadius: '8px'
    }}
    onMouseOver={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
    onMouseOut={(e) => !disabled && (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
  >
    {icon}
  </button>
);

const AccuracyDisplay = ({ platform, accuracy, username }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{username}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{accuracy}%</div>
    </div>
    <div className="accuracy-circle" style={{ 
        '--percentage': accuracy, 
        width: '44px', 
        height: '44px',
        fontSize: '0.8rem',
        filter: platform === 'black' ? 'hue-rotate(180deg)' : 'none'
    }}>
      <div className="accuracy-value"></div>
    </div>
  </div>
);

export default ReviewPage;
