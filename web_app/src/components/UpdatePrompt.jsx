import { useState, useEffect } from 'react';
import { colors } from '../config/theme';

export default function UpdatePrompt() {
  const [updateData, setUpdateData] = useState(null);

  useEffect(() => {
    const handler = (e) => setUpdateData(e.detail);
    window.addEventListener('vite-pwa:update-prompt', handler);
    return () => window.removeEventListener('vite-pwa:update-prompt', handler);
  }, []);

  const handleUpdate = () => {
    if (updateData?.reload) updateData.reload();
    else window.location.reload();
  };

  if (!updateData) return null;

  return (
    <div style={{
      position: 'fixed', top: 16, left: 16, right: 16, zIndex: 9999,
      background: colors.glass, backdropFilter: 'blur(16px)',
      border: `1px solid ${colors.glassBorder}`,
      borderRadius: 16, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontSize: 20 }}>🆕</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Nuova versione disponibile</div>
        <div style={{ fontSize: 12, color: colors.textHint }}>Aggiorna per avere le ultime novità</div>
      </div>
      <button onClick={handleUpdate} style={{
        padding: '8px 16px', border: 'none', borderRadius: 10,
        background: colors.goldGradient, color: '#0F1115', fontWeight: 700, fontSize: 13,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>Aggiorna</button>
    </div>
  );
}
