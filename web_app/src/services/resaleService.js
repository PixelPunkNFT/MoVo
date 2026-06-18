import api from './api';

export const resaleService = {
  getResales: (params) => api.get('/resales', { params }),
  getById: (id) => api.get(`/resales/${id}`),
  create: (data) => api.post('/resales', data),
  update: (id, data) => api.put(`/resales/${id}`, data),
  delete: (id) => api.delete(`/resales/${id}`),
  markAsSold: (id) => api.put(`/resales/${id}/sold`),
  claim: (id) => api.post(`/resales/${id}/claim`),
  contactSeller: (id) => api.post(`/resales/${id}/contact`),
  getMyResales: (params) => api.get('/resales/my', { params }),
  getMyRequests: () => api.get('/resales/my-requests'),
};
