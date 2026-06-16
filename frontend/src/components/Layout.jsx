import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, Target, Globe } from 'lucide-react';
import { useLanguage } from './LanguageProvider';
import LanguageSelector from './LanguageSelector';

const Layout = ({ children }) => {
  const { t, lang } = useLanguage();
  const location = useLocation();

  const isAr = lang === 'ar';

  return (
    <div className="layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass-card" style={{ 
        width: '260px', 
        borderRadius: 0, 
        borderRight: '1px solid var(--glass-border)',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        [isAr ? 'right' : 'left']: 0
      }}>
        <Link to="/" className="brand-font" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
          {t('title')}
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavLink to="/" icon={<LayoutDashboard size={20} />} label={t('title')} active={location.pathname === '/'} />
          {/* Note: In a real app we'd keep track of the current username to enable these links */}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <LanguageSelector />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        [isAr ? 'marginRight' : 'marginLeft']: '260px',
        padding: '40px'
      }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavLink = ({ to, icon, label, active }) => (
  <Link to={to} style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    transition: '0.2s'
  }}>
    {icon}
    <span style={{ fontWeight: 500 }}>{label}</span>
  </Link>
);

export default Layout;
