import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors, radius, shadow } from '../../config/theme';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { firstName, lastName, email, phone, password, dateOfBirth } = form;
    if (!firstName || !lastName || !email || !phone || !password || !dateOfBirth) {
      setError('Compila tutti i campi');
      return;
    }
    if (password.length < 6) {
      setError('La password deve essere almeno 6 caratteri');
      return;
    }
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 18) {
      setError('Devi avere almeno 18 anni');
      return;
    }
    setLoading(true);
    try {
      await register(form);
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
        <img src="/Movo.png" alt="Movo" style={{ height: 192, width: 'auto', marginBottom: 8 }} />
        <p style={s.brandTag}>Unisciti alla community</p>
      </div>

      <div style={s.card}>
        <h2 style={s.title}>Crea Account</h2>
        <p style={s.sub}>Compila i campi per registrarti</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>First Name</label>
              <input
                style={inputStyle('firstName')}
                name="firstName"
                placeholder="Mario"
                value={form.firstName}
                onChange={handleChange}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Last Name</label>
              <input
                style={inputStyle('lastName')}
                name="lastName"
                placeholder="Rossi"
                value={form.lastName}
                onChange={handleChange}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={inputStyle('email')}
              name="email"
              type="email"
              placeholder="tua@email.com"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Phone</label>
            <input
              style={inputStyle('phone')}
              name="phone"
              type="tel"
              placeholder="3331234567"
              value={form.phone}
              onChange={handleChange}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              style={inputStyle('password')}
              name="password"
              type="password"
              placeholder="Minimo 6 caratteri"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Date of Birth</label>
            <input
              style={inputStyle('dateOfBirth')}
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              onFocus={() => setFocusedField('dateOfBirth')}
              onBlur={() => setFocusedField(null)}
            />
          </div>
          <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
        </form>

        <Link to="/login" style={s.link}>
          Hai già un account?{' '}
          <span style={{ color: colors.gold, fontWeight: 700 }}>Accedi</span>
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
  row: { display: 'flex', gap: 12, marginBottom: 0 },
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
  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: 20,
    color: colors.textHint,
    textDecoration: 'none',
    fontSize: 13,
  },
};
