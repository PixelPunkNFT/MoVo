import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius, shadow } from '../../config/theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Compila tutti i campi');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...s.input,
    borderColor: focusedField === field ? colors.gold : s.input.borderColor,
  });

  return (
    <div style={s.container}>
      <div style={s.brand}>
        <img src="/Movo.png" alt="Movo" style={{ height: 172, width: 'auto', marginBottom: 8 }} />
        
      </div>

      <div style={s.card}>
        <h2 style={s.title}>Bentornato</h2>
        <p style={s.sub}>Accedi per continuare</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={inputStyle('email')}
              type="email"
              placeholder="tua@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={inputStyle('password')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <Link to="/forgot-password" style={s.forgotLink}>Password dimenticata?</Link>
          <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <Link to="/register" style={s.link}>
          Non hai un account?{' '}
          <span style={{ color: colors.gold, fontWeight: 700 }}>Registrati</span>
        </Link>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bg,
    padding: 24,
    gap: 36,
  },
  brand: { textAlign: 'center' },
  brandIcon: { fontSize: 64, display: 'block', marginBottom: 8 },
  brandName: {
    fontSize: 36,
    fontWeight: 800,
    letterSpacing: -0.5,
    margin: 0,
    color: colors.textPrimary,
  },
  brandTag: { fontSize: 14, color: colors.textHint, marginTop: 4 },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 20,
    background: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    backdropFilter: 'blur(20px)',
    boxShadow: shadow.glass,
    boxSizing: 'border-box',
  },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 4px' },
  sub: { fontSize: 13, color: colors.textHint, margin: '0 0 28px' },
  error: {
    background: colors.errorBg,
    color: colors.error,
    padding: '12px 16px',
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 13,
    border: `1px solid ${colors.error}33`,
  },
  field: { marginBottom: 16 },
  label: {
    display: 'block',
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: 14,
    background: colors.surface,
    color: colors.textPrimary,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%',
    padding: 16,
    border: 'none',
    borderRadius: 14,
    background: colors.goldGradient,
    color: '#0F1115',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: shadow.glow,
  },
  forgotLink: {
    display: 'block',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 16,
    color: colors.gold,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: 20,
    color: colors.textHint,
    textDecoration: 'none',
    fontSize: 13,
  },
};
