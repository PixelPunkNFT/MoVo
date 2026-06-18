import api from './api';

export const bookingService = {
  bookRide: (rideId, data) => api.post(`/bookings/${rideId}`, data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getReceived: () => api.get('/bookings/received'),
  confirm: (id) => api.put(`/bookings/${id}/confirm`),
  reject: (id, data) => api.put(`/bookings/${id}/reject`, data),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  cancel: (id, data) => api.delete(`/bookings/${id}`, { data }),
};
