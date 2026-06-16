import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Target, TrendingDown, ArrowRight, MousePointer2 } from 'lucide-react';
import { api } from '../api/client';
import { useLanguage } from '../components/LanguageProvider';
import MoveBadge from '../components/MoveBadge';

const WeaknessPage = () => {
  const { username } = useParams();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeaknesses();
  }, [username]);

  const fetchWeaknesses = async () => {
    setLoading(true);
    try {
      const { data } = await api.getWeaknesses(username);
      setData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>{t('loading')}</div>;
  if (!data) return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>{t('error')}</div>;

  const { 
    main_weakness = 'No data available', 
    total_analyzed_games = 0, 
    total_player_moves_analyzed = 0,
    average_points_lost = 0,
    phase_bad_move_rate = { opening: 0, middlegame: 0, endgame: 0 },
    color_bad_move_rate = { white: 0, black: 0 },
    critical_mistakes = []
  } = data || {};

  if (total_analyzed_games === 0) {
    return (
      <div className="weakness-page fade-in" style={{ textAlign: 'center', padding: '100px' }}>
         <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{t('weaknesses')}</h2>
         <p style={{ color: 'var(--text-muted)' }}>{data?.message || "No analyzed games yet. Analyze games first."}</p>
         <div style={{ marginTop: '32px' }}>
            <Link to={-1} style={{ padding: '12px 24px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px' }}>
              {t('backToGames')}
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="weakness-page fade-in">
      <header style={{ marginBottom: '32px' }}>
        <Link to={-1} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
          <ChevronLeft size={16} /> {t('backToGames')}
        </Link>
        <h2 style={{ fontSize: '2rem' }}>{t('weaknesses')} for {username}</h2>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
         {/* Main Weakness Hero */}
         <div className="glass-card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Target size={28} color="var(--primary)" /> {t('mainWeakness')}
            </h3>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{main_weakness}</p>
         </div>

         {/* General Stats */}
         <div className="glass-card">
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <StatItem label="Games Analyzed" value={total_analyzed_games} />
               <StatItem label="Moves Analyzed" value={total_player_moves_analyzed} />
               <StatItem label="Avg Points Lost" value={average_points_lost.toFixed(3)} />
            </div>
         </div>

         {/* Phase Rates */}
         <div className="glass-card">
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{t('moveRate')} (Phase)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <RateItem label={t('opening')} rate={phase_bad_move_rate.opening} />
               <RateItem label={t('middlegame')} rate={phase_bad_move_rate.middlegame} />
               <RateItem label={t('endgame')} rate={phase_bad_move_rate.endgame} />
            </div>
         </div>

         {/* Color Rates */}
         <div className="glass-card">
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{t('moveRate')} (Color)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <RateItem label="White" rate={color_bad_move_rate.white} />
               <RateItem label="Black" rate={color_bad_move_rate.black} />
            </div>
         </div>

         {/* Critical Mistakes */}
         <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <TrendingDown size={24} color="var(--color-blunder)" /> {t('criticalMistakes')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {critical_mistakes.map((m, idx) => (
                 <Link 
                   key={idx} 
                   to={`/games/${m.game_id}/review`}
                   className="glass-card"
                   style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'center', width: '60px' }}>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Game</div>
                         <div style={{ fontWeight: 700 }}>#{m.game_id}</div>
                      </div>
                      <div>
                         <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Move {m.move_number} • {m.turn}</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>{m.move_san}</span>
                            <MoveBadge classification={m.classification} />
                         </div>
                      </div>
                      <div style={{ marginLeft: '20px' }}>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('bestMove')}</div>
                         <div style={{ color: 'var(--color-best)', fontWeight: 600 }}>{m.best_move_san || m.best_move}</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Points Lost</div>
                         <div style={{ color: 'var(--color-blunder)', fontWeight: 700 }}>-{m.points_lost}</div>
                      </div>
                      <MousePointer2 size={18} color="var(--primary)" />
                   </div>
                 </Link>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontWeight: 500 }}>{label}</span>
    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{value}</span>
  </div>
);

const RateItem = ({ label, rate }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
       <span>{label}</span>
       <span style={{ fontWeight: 600 }}>{(rate * 100).toFixed(1)}%</span>
    </div>
    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
       <div style={{ width: `${rate * 100}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
    </div>
  </div>
);

export default WeaknessPage;
