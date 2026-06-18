import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadPhoto: (formData) => api.post('/auth/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  logout: () => api.post('/auth/logout', {}),
  toggleNearbyAlerts: (enabled) => api.put('/auth/nearby-alerts', { enabled }),
  saveLocation: (latitude, longitude) => api.put('/auth/location', { latitude, longitude }),
  saveFavoriteVenues: (venueIds) => api.put('/auth/favorite-venues', { venueIds }),
};
