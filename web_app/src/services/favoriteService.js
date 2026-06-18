import api from './api';

export const favoriteService = {
  toggle: (resaleId) => api.post(`/favorites/${resaleId}`),
  getMyFavorites: () => api.get('/favorites'),
  check: (resaleId) => api.get(`/favorites/${resaleId}/check`),
};
