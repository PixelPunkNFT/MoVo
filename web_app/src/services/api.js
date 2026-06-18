import axios from 'axios';
import { API_URL } from '../config/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    let message = data?.message || 'Errore di connessione';
    if (data?.errors?.length) {
      message += '\n' + data.errors.map(e => `- ${e.field}: ${e.message}`).join('\n');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
