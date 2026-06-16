import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GamesPage from './pages/GamesPage';
import ReviewPage from './pages/ReviewPage';
import WeaknessPage from './pages/WeaknessPage';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';

function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/players/:platform/:username/games" element={<GamesPage />} />
              <Route path="/players/:platform/:username/weaknesses" element={<WeaknessPage />} />
              <Route path="/games/:gameId/review" element={<ReviewPage />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    </LanguageProvider>
  );
}

export default App;
