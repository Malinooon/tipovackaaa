// Placeholder file for API service
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/auth/me')
};

export const leagueService = {
  getLeagues: () => api.get('/api/leagues'),
  getLeague: (id) => api.get(`/api/leagues/${id}`),
  createLeague: (leagueData) => api.post('/api/leagues', leagueData),
  joinLeague: (inviteCode) => api.post('/api/leagues/join', { inviteCode })
};

export const matchService = {
  getMatches: () => api.get('/api/matches'),
  getMatch: (id) => api.get(`/api/matches/${id}`)
};

export const predictionService = {
  getPredictions: (leagueId) => api.get(`/api/predictions/league/${leagueId}`),
  createPrediction: (predictionData) => api.post('/api/predictions', predictionData)
};

export default api;
