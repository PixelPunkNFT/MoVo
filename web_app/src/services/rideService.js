import api from './api';

export const rideService = {
  search: (params, options) => api.get('/rides/search', { params, ...options }),
  getById: (id) => api.get(`/rides/${id}`),
  create: (data) => api.post('/rides', data),
  update: (id, data) => api.put(`/rides/${id}`, data),
  cancel: (id) => api.delete(`/rides/${id}`),
  getMyRidesAsDriver: () => api.get('/rides/my-rides/driver'),
  createSpontaneous: (data) => api.post('/rides/spontaneous', data),
  joinSpontaneous: (rideId) => api.post(`/rides/${rideId}/join`),
};
