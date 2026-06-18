import api from './api';

export const reviewService = {
  addReview: (bookingId, data) => api.post(`/reviews/${bookingId}`, data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  respondToReview: (id, data) => api.post(`/reviews/${id}/response`, data),
  reportReview: (id, data) => api.post(`/reviews/${id}/report`, data),
};
