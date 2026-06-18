import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socketService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) loadUser();
    else setLoading(false);
  }, []);

  const loadUser = async () => {
    try {
      const res = await authService.getMe();
      const token = localStorage.getItem('token');
      if (token) connectSocket(token);
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    connectSocket(res.data.token);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    connectSocket(res.data.token);
    return res.data.user;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const uploadPhoto = async (formData) => {
    const res = await authService.uploadPhoto(formData);
    setUser(res.data.user);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, updateProfile, uploadPhoto }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
