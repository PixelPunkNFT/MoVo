import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleBan: (id) => api.put(`/admin/users/${id}/ban`),
  verifyUser: (id, verified) => api.put(`/admin/users/${id}/verify`, { verified }),
  makeAdmin: (id) => api.put(`/admin/users/${id}/make-admin`),
  getRides: (params) => api.get('/admin/rides', { params }),
  cancelRide: (id) => api.put(`/admin/rides/${id}/cancel`),
  getReportedReviews: (params) => api.get('/admin/reviews/reported', { params }),
  toggleReviewVisibility: (id) => api.put(`/admin/reviews/${id}/toggle-visibility`),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getLogs: (params) => api.get('/logs', { params }),
  getLogStats: () => api.get('/logs/stats'),
};
