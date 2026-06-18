import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#fff' }}>Caricamento...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}
