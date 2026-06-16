import React from 'react';
import { useLanguage } from './LanguageProvider';

const LanguageSelector = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="language-selector" style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => setLang('en')} 
        style={{ opacity: lang === 'en' ? 1 : 0.5, background: 'none', color: 'white', fontWeight: lang === 'en' ? 'bold' : 'normal' }}
      >
        EN
      </button>
      <button 
        onClick={() => setLang('fr')} 
        style={{ opacity: lang === 'fr' ? 1 : 0.5, background: 'none', color: 'white', fontWeight: lang === 'fr' ? 'bold' : 'normal' }}
      >
        FR
      </button>
      <button 
        onClick={() => setLang('ar')} 
        style={{ opacity: lang === 'ar' ? 1 : 0.5, background: 'none', color: 'white', fontWeight: lang === 'ar' ? 'bold' : 'normal' }}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSelector;
