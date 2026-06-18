import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, { auth: { token }, transports: ['polling'] });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const getSocket = () => socket;
