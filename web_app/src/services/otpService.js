import api from './api';

export const otpService = {
  send: () => api.post('/otp/send'),
  verify: (code) => api.post('/otp/verify', { code }),
};
