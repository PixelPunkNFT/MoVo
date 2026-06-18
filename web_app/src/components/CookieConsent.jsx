import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, radius, shadow } from '../config/theme';

const STORAGE_KEY = 'movo_cookie_consent';

const defaultPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState(defaultPreferences);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const save = (p) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, savedAt: new Date().toISOString() }));
    setVisible(false);
  };

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true });
  const savePreferences = () => save(prefs);

  if (!visible) return null;

  return (
    <div style={s.overlay}>
      <div style={s.banner}>
        <div style={{ ...s.header, marginBottom: expanded ? 16 : 0 }}>
          <span style={s.icon}>🍪</span>
          <div>
            <h3 style={s.title}>La tua privacy è importante</h3>
            <p style={s.text}>
              Utilizziamo i cookie per migliorare la tua esperienza sul nostro sito. Alcuni cookie sono necessari per il funzionamento del sito, mentre altri ci aiutano a migliorare le prestazioni e l'esperienza utente.
            </p>
          </div>
        </div>

        {expanded && (
          <div style={s.options}>
            {[
              { key: 'necessary', label: 'Cookie tecnici (necessari)', desc: 'Necessari per il corretto funzionamento del sito.', disabled: true },
              { key: 'analytics', label: 'Cookie analitici', desc: 'Per monitorare le prestazioni e migliorare il servizio.' },
              { key: 'marketing', label: 'Cookie di marketing', desc: 'Per contenuti personalizzati e pubblicità.' },
            ].map(opt => (
              <label key={opt.key} style={s.option}>
                <div style={{ flex: 1 }}>
                  <span style={s.optLabel}>{opt.label}</span>
                  <span style={s.optDesc}>{opt.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs[opt.key]}
                  disabled={opt.disabled}
                  onChange={() => setPrefs(p => ({ ...p, [opt.key]: !p[opt.key] }))}
                  style={s.checkbox}
                />
              </label>
            ))}
          </div>
        )}

        <div style={s.actions}>
          <button style={s.linkBtn} onClick={() => navigate('/privacy')}>Privacy Policy</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {!expanded ? (
              <button style={s.ghostBtn} onClick={() => setExpanded(true)}>Personalizza</button>
            ) : (
              <button style={s.ghostBtn} onClick={savePreferences}>Salva preferenze</button>
            )}
            <button style={s.primaryBtn} onClick={acceptAll}>Accetta tutti</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
    display: 'flex', justifyContent: 'center',
    padding: 16, paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0))',
    pointerEvents: 'none',
  },
  banner: {
    width: '100%', maxWidth: 520,
    background: colors.glass,
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.lg,
    padding: 20,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    pointerEvents: 'auto',
    animation: 'fadeInUp 0.4s ease',
  },
  header: { display: 'flex', gap: 12 },
  icon: { fontSize: 28, flexShrink: 0, marginTop: 2 },
  title: { fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: colors.textPrimary },
  text: { fontSize: 12, color: colors.textHint, lineHeight: 1.5, margin: 0 },
  options: {
    display: 'flex', flexDirection: 'column', gap: 8,
    padding: '12px 0', borderTop: `1px solid ${colors.glassBorder}`, marginBottom: 12,
  },
  option: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', cursor: 'pointer',
  },
  optLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: colors.textPrimary },
  optDesc: { display: 'block', fontSize: 11, color: colors.textHint, marginTop: 2 },
  checkbox: {
    width: 20, height: 20, accentColor: colors.gold, cursor: 'pointer', flexShrink: 0,
  },
  actions: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap',
  },
  linkBtn: {
    background: 'none', border: 'none', color: colors.gold, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'inherit',
  },
  ghostBtn: {
    padding: '10px 16px', border: `1px solid ${colors.glassBorder}`, borderRadius: radius.md,
    background: 'transparent', color: colors.textPrimary, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  primaryBtn: {
    padding: '10px 20px', border: 'none', borderRadius: radius.md,
    background: colors.goldGradient, color: '#0F1115', fontSize: 12, fontWeight: 700,
    cursor: 'pointer', boxShadow: shadow.glow, fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
};
