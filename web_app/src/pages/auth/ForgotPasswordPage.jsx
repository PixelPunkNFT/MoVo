import { useState } from 'react';
import { Link } from 'react-router-dom';
import { otpService } from '../../services/otpService';
import api from '../../services/api';
import { colors, radius, shadow } from '../../config/theme';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Inserisci la tua email'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data?.resetToken) setDevToken(res.data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Errore durante l\'invio');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.container}>
      <div style={s.brand}>
        <img src="/Movo.png" alt="Movo" style={{ height: 192, width: 'auto', marginBottom: 8 }} />
      </div>

      <div style={s.card}>
        {sent ? (
          <>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>📧</div>
            <h2 style={s.title}>Email Inviata</h2>
            <p style={s.sub}>Controlla la tua casella di posta. Troverai un link per reimpostare la password.</p>
            {devToken && (
              <div style={s.devBox}>
                <p style={{ fontSize: 12, color: colors.textHint, marginBottom: 8 }}>
                  ⚙️ Modalità sviluppo — token di reset:
                </p>
                <p style={{ fontSize: 11, color: colors.gold, wordBreak: 'break-all', fontFamily: 'monospace' }}>{devToken}</p>
                <p style={{ fontSize: 11, color: colors.textHint, marginTop: 8 }}>
                  Vai a: <Link to={`/reset-password/${devToken}`} style={{ color: colors.gold }}>/reset-password/{devToken.slice(0, 8)}...</Link>
                </p>
              </div>
            )}
            <Link to="/login" style={s.backLink}>← Torna al login</Link>
          </>
        ) : (
          <>
            <h2 style={s.title}>Password dimenticata?</h2>
            <p style={s.sub}>Inserisci la tua email e ti invieremo un link per reimpostarla.</p>

            {error && <div style={s.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input style={s.input} type="email" placeholder="tua@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button style={s.btn} disabled={loading}>
                {loading ? 'Invio in corso...' : 'Invia link di reset'}
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
  devBox: { marginTop: 20, padding: 16, borderRadius: radius.sm, background: colors.surface, border: `1px solid ${colors.glassBorder}` },
};
