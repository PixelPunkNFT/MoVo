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
    { icon: '🌐', text: 'Apri il sito in Safari' },
    { icon: '📤', text: 'Tocca il menu Condividi (icona in basso)' },
    { icon: '🏠', text: 'Scorri e scegli "Aggiungi alla Home"' },
    { icon: '✅', text: 'Tocca "Aggiungi" in alto a destra' },
  ],
  android: [
    { icon: '🌐', text: 'Apri in Chrome' },
    { icon: '⋮', text: 'Tocca i tre puntini in alto a destra' },
    { icon: '🏠', text: 'Scegli "Aggiungi alla schermata Home"' },
    { icon: '✅', text: 'Tocca "Aggiungi" in basso' },
  ],
  other: [
    { icon: '🌐', text: 'Apri nel browser' },
    { icon: '📋', text: 'Cerca "Aggiungi alla Home" nel menu' },
  ],
};

export default function InstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const browser = getBrowser();

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAction = async () => {
    if (deferredPrompt) {
      const result = await deferredPrompt.prompt();
      if (result.outcome === 'accepted') setDeferredPrompt(null);
      return;
    }
    setShowSteps(!showSteps);
  };

  if (isStandalone) return null;

  return (
    <div style={{
      padding: '14px', borderRadius: 12, background: colors.card, marginBottom: 16,
      border: `1px solid ${colors.goldGlow}`, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/Movo.png" alt="Movo" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>📲 Scarica Movo</div>
          <div style={{ fontSize: 12, color: colors.textHint }}>
            {deferredPrompt ? 'Aggiungi alla home con un clic' : 'Aggiungi alla home del telefono'}
          </div>
        </div>
        <button onClick={handleAction} style={{
          padding: '8px 14px', border: 'none', borderRadius: 10,
          background: colors.goldGradient, color: '#0F1115',
          fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}>
          {deferredPrompt ? 'Installa' : 'Come fare'}
        </button>
      </div>

      {showSteps && !deferredPrompt && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.glassBorder}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.goldLight, marginBottom: 8 }}>
            Istruzioni per {browser === 'ios' ? 'iPhone/iPad' : browser === 'android' ? 'Android' : 'il tuo dispositivo'}:
          </div>
          {STEPS[browser].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 0', fontSize: 12, color: colors.textSecondary,
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
