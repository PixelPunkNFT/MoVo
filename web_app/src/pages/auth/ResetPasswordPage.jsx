import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { colors, radius, shadow } from '../../config/theme';

export default function ResetPasswordPage() {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) { setError('La password deve essere almeno 6 caratteri'); return; }
    if (password !== confirm) { setError('Le password non coincidono'); return; }
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${resetToken}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Errore durante il reset');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.container}>
      <div style={s.brand}>
        <img src="/Movo.png" alt="Movo" style={{ height: 192, width: 'auto', marginBottom: 8 }} />
      </div>

      <div style={s.card}>
        {done ? (
          <>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>✅</div>
            <h2 style={s.title}>Password reimpostata!</h2>
            <p style={s.sub}>Reindirizzamento al login...</p>
          </>
        ) : (
          <>
            <h2 style={s.title}>Nuova Password</h2>
            <p style={s.sub}>Scegli una nuova password per il tuo account.</p>

            {error && <div style={s.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Nuova Password</label>
                <input style={s.input} type="password" placeholder="Minimo 6 caratteri" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Conferma Password</label>
                <input style={s.input} type="password" placeholder="Ripeti la password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              <button style={s.btn} disabled={loading}>
                {loading ? 'Reset in corso...' : 'Reimposta Password'}
              </button>
            </form>

            <Link to="/login" style={s.backLink}>← Torna al login</Link>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: colors.bg, padding: 24, gap: 28 },
  brand: { textAlign: 'center' },
  brandIcon: { fontSize: 48, display: 'block', marginBottom: 8 },
  brandName: { fontSize: 32, fontWeight: 800, letterSpacing: -0.5, margin: 0 },
  card: { width: '100%', maxWidth: 400, padding: 32, borderRadius: radius.lg, background: colors.glass, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${colors.glassBorder}`, boxShadow: shadow.glass },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 6px', textAlign: 'center' },
  sub: { fontSize: 13, color: colors.textHint, margin: '0 0 24px', textAlign: 'center', lineHeight: 1.5 },
  error: { background: colors.errorBg, color: colors.error, padding: '10px 14px', borderRadius: radius.sm, marginBottom: 16, fontSize: 13, border: `1px solid ${colors.error}33` },
  field: { marginBottom: 16 },
  label: { display: 'block', color: colors.textSecondary, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { width: '100%', padding: '14px 16px', border: `1px solid ${colors.glassBorder}`, borderRadius: radius.md, background: colors.surface, color: colors.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  btn: { width: '100%', padding: '14px', border: 'none', borderRadius: radius.md, background: colors.goldGradient, color: '#0F1115', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: shadow.glow, letterSpacing: 0.3, opacity: loading => loading ? 0.6 : 1 },
  backLink: { display: 'block', textAlign: 'center', marginTop: 20, color: colors.gold, textDecoration: 'none', fontSize: 13, fontWeight: 600 },
};
