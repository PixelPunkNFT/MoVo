import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { otpService } from '../../services/otpService';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../config/theme';

export default function OtpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('send');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await otpService.send();
      setMessage(res.data?.message || `Codice OTP inviato a ${user?.email || 'tua email'}`);
      setStep('verify');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Errore invio OTP');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { setMessage('Inserisci il codice a 6 cifre'); return; }
    setLoading(true);
    setMessage('');
    try {
      await otpService.verify(code);
      setMessage('✅ Account verificato con successo!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Codice non valido o scaduto');
    } finally { setLoading(false); }
  };

  if (user?.isPhoneVerified) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>✅</div>
          <h2 style={styles.title}>Account già verificato</h2>
          <p style={styles.subtitle}>La tua email {user.email} è già stata verificata.</p>
          <button style={styles.btn} onClick={() => navigate('/profile')}>Torna al profilo</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>{step === 'send' ? '📧' : '🔐'}</div>
        <h2 style={styles.title}>{step === 'send' ? 'Verifica il tuo account' : 'Inserisci il codice'}</h2>

        {step === 'send' ? (
          <>
            <p style={styles.subtitle}>Riceverai un codice OTP via email a <strong>{user?.email || 'non impostata'}</strong></p>
            {message && <p style={{ ...styles.message, color: message.includes('✅') ? colors.success : colors.warning }}>{message}</p>}
            <button style={styles.btn} onClick={handleSend} disabled={loading}>
              {loading ? 'Invio in corso...' : 'Invia codice OTP'}
            </button>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>Inserisci il codice a 6 cifre ricevuto via email</p>
            <input
              style={styles.codeInput}
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            />
            {message && <p style={{ ...styles.message, color: message.includes('✅') ? colors.success : message.includes('❌') ? colors.error : colors.warning }}>{message}</p>}
            <button style={styles.btn} onClick={handleVerify} disabled={loading || code.length !== 6}>
              {loading ? 'Verifica in corso...' : 'Verifica codice'}
            </button>
            <button style={styles.linkBtn} onClick={() => { setStep('send'); setCode(''); setMessage(''); }}>
              ← Invia di nuovo il codice
            </button>
          </>
        )}
      </div>

      {step === 'verify' && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: colors.textHint }}>
            Non hai ricevuto il codice? Controlla che l'email sia corretta nella pagina del profilo.
            In sviluppo il codice è stampato nella console del server.
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' },
  card: { width: '100%', maxWidth: 380, padding: 24, borderRadius: 16, background: colors.card },
  title: { textAlign: 'center', fontSize: 20, fontWeight: 700, margin: '0 0 8px' },
  subtitle: { textAlign: 'center', fontSize: 13, color: colors.textSecondary, margin: '0 0 20px', lineHeight: 1.5 },
  message: { textAlign: 'center', fontSize: 13, margin: '0 0 16px', padding: '8px 12px', borderRadius: 8, background: colors.surface },
  codeInput: {
    width: '100%', padding: '14px 12px', marginBottom: 16, border: `2px solid ${colors.primary}`,
    borderRadius: 12, background: colors.surface, color: colors.textPrimary, fontSize: 28,
    textAlign: 'center', letterSpacing: 8, outline: 'none', boxSizing: 'border-box', fontWeight: 700,
  },
  btn: {
    width: '100%', padding: 14, border: 'none', borderRadius: 12, background: colors.primary,
    color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
    opacity: (disabled) => disabled ? 0.6 : 1,
  },
  linkBtn: { display: 'block', width: '100%', padding: 12, border: 'none', background: 'none', color: colors.primary, fontSize: 13, cursor: 'pointer', textAlign: 'center', marginTop: 8 },
};
