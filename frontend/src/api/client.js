import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  healthCheck: () => client.get('/health'),
  
  importLatestGames: (username) => client.post(`/players/${username}/import-latest`),
  
  getPlayerGames: (username) => client.get(`/players/${username}/games`),
  
  getGame: (gameId) => client.get(`/games/${gameId}`),
  
  analyzeGame: (gameId) => client.post(`/games/${gameId}/analyze`),
  
  analyzePlayerGames: (username, limit = 5) => 
    client.post(`/players/${username}/analyze-games?limit=${limit}`),
  
  getGameAnalysis: (gameId) => client.get(`/games/${gameId}/analysis`),
  
  getGameReview: (gameId) => client.get(`/games/${gameId}/review`),
  
  getWeaknesses: (username) => client.get(`/players/${username}/weaknesses`),
};

export default client;
