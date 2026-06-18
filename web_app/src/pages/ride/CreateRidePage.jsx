import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '../../contexts/RideContext';
import { colors } from '../../config/theme';
import VenuePicker from '../../components/VenuePicker';

export default function CreateRidePage() {
  const { createSpontaneousRide } = useRides();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    destination: { name: '', address: '', city: 'Roma', location: { type: 'Point', coordinates: [12.4964, 41.9028] } },
    dateTime: '',
    availableSeats: 3,
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination.name) { alert('Inserisci il nome del locale'); return; }
    if (!form.dateTime) { alert('Inserisci l\'orario'); return; }
    setLoading(true);
    try {
      const ride = await createSpontaneousRide(form);
      navigate(`/rides/${ride._id}`);
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const defaultDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0).toISOString().slice(0, 16);

  return (
    <div>
      <div style={s.header}>
        <span style={s.badge}>⚡ Nuovo Passaggio</span>
        <p style={s.subtitle}>Pubblica in 10 secondi, senza veicolo né prezzo</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label style={s.label}>Dove vai?</label>
        <VenuePicker
          value={form.destination.name}
          placeholder="Digita il nome del locale..."
          onChange={(dest) => setForm({ ...form, destination: dest })}
        />

        <label style={s.label}>A che ora?</label>
        <input style={s.input} type="datetime-local" value={form.dateTime}
          onChange={e => setForm({ ...form, dateTime: e.target.value })}
          min={defaultDateTime} required />

        <label style={s.label}>Posti liberi</label>
        <input style={s.input} type="number" min="1" max="8" value={form.availableSeats}
          onChange={e => setForm({ ...form, availableSeats: parseInt(e.target.value) || 1 })} />

        <label style={s.label}>Note (opzionale)</label>
        <textarea style={s.textarea} placeholder="Es: Parto da Roma sud, chi viene?" maxLength={200} value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })} />

        <button style={s.btn} disabled={loading}>
          {loading ? 'Pubblicazione...' : '⚡ Pubblica Passaggio'}
        </button>
      </form>

      <p style={s.info}>Non serve un veicolo registrato né un prezzo. I partecipanti si accordano in chat.</p>
    </div>
  );
}

const s = {
  header: { textAlign: 'center', marginBottom: 24 },
  badge: {
    display: 'inline-block', padding: '6px 16px', borderRadius: 20,
    background: '#D4AF3722', color: colors.gold, fontSize: 13, fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: { fontSize: 13, color: colors.textHint, margin: 0 },
  label: { display: 'block', color: colors.textSecondary, fontSize: 13, marginBottom: 4, marginTop: 16 },
  input: {
    width: '100%', padding: '12px 14px', border: 'none', borderRadius: 10,
    background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '12px 14px', border: 'none', borderRadius: 10,
    background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none',
    boxSizing: 'border-box', minHeight: 80, resize: 'vertical', fontFamily: 'inherit',
  },
  btn: {
    width: '100%', padding: '14px', marginTop: 24, border: 'none', borderRadius: 12,
    background: colors.goldGradient, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(212, 175, 55, 0.25)',
  },
  info: {
    textAlign: 'center', fontSize: 12, color: colors.textHint, marginTop: 16, lineHeight: 1.5,
  },
};
