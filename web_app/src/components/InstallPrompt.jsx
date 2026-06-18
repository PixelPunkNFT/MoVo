import { useState, useEffect } from 'react';
import { colors } from '../config/theme';

function getBrowser() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

const STEPS = {
  ios: [
    { icon: '📤', text: 'Tocca Condividi in Safari' },
    { icon: '🏠', text: 'Scorri e scegli "Aggiungi alla Home"' },
    { icon: '✅', text: 'Tocca "Aggiungi" in alto' },
  ],
  android: [
    { icon: '⋮', text: 'Tocca i tre puntini in Chrome' },
    { icon: '🏠', text: 'Scegli "Aggiungi alla schermata Home"' },
    { icon: '✅', text: 'Tocca "Aggiungi"' },
  ],
  other: [
    { icon: '📋', text: 'Cerca "Aggiungi alla Home" nel menu del browser' },
  ],
};

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const browser = getBrowser();

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const fallback = setTimeout(() => {
      if (!visible && !isStandalone) setVisible(true);
    }, 30000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallback);
    };
  }, []);

  const handleAction = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') setVisible(false);
      setDeferredPrompt(null);
      return;
    }
    setShowSteps(!showSteps);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
  };

  if (isStandalone || !visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9999,
      background: colors.glass, backdropFilter: 'blur(16px)',
      border: `1px solid ${colors.glassBorder}`,
      borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/Movo.png" alt="Movo" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {deferredPrompt ? 'Installa Movo' : 'Aggiungi alla Home'}
          </div>
          <div style={{ fontSize: 12, color: colors.textHint }}>
            {deferredPrompt ? 'Accesso rapido con un clic' : browser === 'ios' ? 'Istruzioni per iPhone' : browser === 'android' ? 'Istruzioni per Android' : ''}
          </div>
        </div>
        <button onClick={handleAction} style={{
          padding: '8px 16px', border: 'none', borderRadius: 10,
          background: colors.goldGradient, color: '#0F1115', fontWeight: 700, fontSize: 13,
          cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}>
          {deferredPrompt ? 'Installa' : 'Come fare'}
        </button>
        <button onClick={handleDismiss} style={{
          background: 'none', border: 'none', color: colors.textHint, cursor: 'pointer', fontSize: 18, padding: 4,
        }}>✕</button>
      </div>

      {showSteps && !deferredPrompt && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.glassBorder}` }}>
          {STEPS[browser].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '4px 0', fontSize: 12, color: colors.textSecondary,
            }}>
              <span style={{ width: 20, textAlign: 'center' }}>{s.icon}</span>
              <span>{s.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
