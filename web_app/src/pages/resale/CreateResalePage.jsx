import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../config/theme';
import { resaleService } from '../../services/resaleService';

const categories = ['Salsa', 'Bachata', 'Kizomba', 'Discoteca', 'Concerto', 'Festival', 'Altro'];

export default function CreateResalePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [form, setForm] = useState({
    eventName: '',
    category: '',
    eventDate: '',
    eventTime: '',
    city: '',
    location: '',
    originalPrice: '',
    askingPrice: '',
    quantity: 1,
    description: '',
    notes: '',
  });

  const handleFileChange = (e) => {
    setScreenshotFiles(Array.from(e.target.files));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.eventName.trim()) { alert('Inserisci il nome dell\'evento'); return; }
    if (!form.category) { alert('Seleziona una categoria'); return; }
    if (!form.eventDate) { alert('Inserisci la data dell\'evento'); return; }
    if (!form.city.trim()) { alert('Inserisci la città'); return; }
    if (!form.location.trim()) { alert('Inserisci il luogo'); return; }
    if (!form.originalPrice || parseFloat(form.originalPrice) < 0) { alert('Inserisci un prezzo originale valido'); return; }
    if (!form.askingPrice || parseFloat(form.askingPrice) < 0) { alert('Inserisci un prezzo richiesto valido'); return; }
    if (!form.quantity || parseInt(form.quantity) < 1) { alert('Inserisci una quantità valida'); return; }
    if (screenshotFiles.length === 0) { alert('Carica almeno uno screenshot'); return; }

    const fd = new FormData();
    fd.append('eventName', form.eventName.trim());
    fd.append('category', form.category);
    fd.append('eventDate', form.eventDate);
    if (form.eventTime) fd.append('eventTime', form.eventTime);
    fd.append('city', form.city.trim());
    fd.append('location', form.location.trim());
    fd.append('originalPrice', form.originalPrice);
    fd.append('askingPrice', form.askingPrice);
    fd.append('quantity', form.quantity);
    if (form.description.trim()) fd.append('description', form.description.trim());
    if (form.notes.trim()) fd.append('notes', form.notes.trim());
    screenshotFiles.forEach((file) => fd.append('screenshots', file));

    setLoading(true);
    try {
      await resaleService.create(fd);
      navigate('/resales');
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>Vendi Biglietto</h2>

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Nome Evento</label>
        <input style={styles.input} name="eventName" value={form.eventName} onChange={handleChange} placeholder="Es. Serata Salsa al Tropico" required />

        <label style={styles.label}>Categoria</label>
        <select style={styles.input} name="category" value={form.category} onChange={handleChange} required>
          <option value="">Seleziona categoria</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Data Evento</label>
            <input style={styles.input} type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Orario</label>
            <input style={styles.input} type="time" name="eventTime" value={form.eventTime} onChange={handleChange} />
          </div>
        </div>

        <label style={styles.label}>Città</label>
        <input style={styles.input} name="city" value={form.city} onChange={handleChange} placeholder="Es. Roma" required />

        <label style={styles.label}>Luogo / Venue</label>
        <input style={styles.input} name="location" value={form.location} onChange={handleChange} placeholder="Es. Tropico Latina" required />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Prezzo Originale (€)</label>
            <input style={styles.input} type="number" min="0" step="0.01" name="originalPrice" value={form.originalPrice} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Prezzo Richiesto (€)</label>
            <input style={styles.input} type="number" min="0" step="0.01" name="askingPrice" value={form.askingPrice} onChange={handleChange} required />
          </div>
        </div>

        <label style={styles.label}>Quantità</label>
        <input style={styles.input} type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required />

        <label style={styles.label}>Descrizione</label>
        <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} name="description" value={form.description} onChange={handleChange} placeholder="Descrizione opzionale..." maxLength={1000} />

        <label style={styles.label}>Screenshot / Foto</label>
        <input
          style={styles.input}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          required
        />
        {screenshotFiles.length > 0 && (
          <p style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
            {screenshotFiles.length} file selezionati: {screenshotFiles.map((f) => f.name).join(', ')}
          </p>
        )}

        <label style={styles.label}>Note</label>
        <textarea style={{ ...styles.input, minHeight: 60, resize: 'vertical' }} name="notes" value={form.notes} onChange={handleChange} placeholder="Note aggiuntive (opzionale)" />

        <button style={styles.btn} disabled={loading}>
          {loading ? 'Pubblicazione...' : 'Pubblica Annuncio'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  row: { display: 'flex', gap: 12 },
  label: { display: 'block', color: colors.textSecondary, fontSize: 13, marginBottom: 4, marginTop: 12 },
  input: {
    width: '100%', padding: '12px 14px', border: 'none', borderRadius: 10,
    background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '14px', marginTop: 20, border: 'none', borderRadius: 12,
    background: colors.primary, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer',
  },
};
