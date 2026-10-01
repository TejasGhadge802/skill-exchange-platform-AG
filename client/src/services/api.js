import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Firebase ID token automatically to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback for dev / mock session token stored in localStorage
        const storedToken = localStorage.getItem('skill_exchange_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
    } catch (error) {
      console.warn('[API Interceptor Warning]: Failed to fetch auth token', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

