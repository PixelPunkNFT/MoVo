import api from './api';

export const chatService = {
  getMyChats: (params) => api.get('/chats', { params }),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  createChat: (data) => api.post('/chats/create', data),
  deleteChat: (id) => api.delete(`/chats/${id}`),
  archiveChat: (chatId) => api.put(`/chats/${chatId}/archive`),
  unarchiveChat: (chatId) => api.put(`/chats/${chatId}/unarchive`),
};
