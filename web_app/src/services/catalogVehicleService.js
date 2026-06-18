import api from './api';

export const catalogVehicleService = {
  getAll: (params) => api.get('/vehicle-catalog', { params }),
  getBrands: () => api.get('/vehicle-catalog/brands'),
  getModelsByBrand: (brand) => api.get(`/vehicle-catalog/models/${brand}`),
  create: (data) => api.post('/vehicle-catalog', data),
  update: (id, data) => api.put(`/vehicle-catalog/${id}`, data),
  delete: (id) => api.delete(`/vehicle-catalog/${id}`),
};
