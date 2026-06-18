const BACKEND_URL = import.meta.env.VITE_API_URL || ''
export const API_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api'
export const SOCKET_URL = BACKEND_URL || window.location.origin
