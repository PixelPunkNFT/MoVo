import api from './api';

export const reportService = {
  create: (data) => api.post('/reports', data),
};
