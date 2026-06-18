import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../config/theme';
import { resaleService } from '../../services/resaleService';
import LoadingSpinner from '../../components/LoadingSpinner';

const categories = ['Salsa', 'Bachata', 'Kizomba', 'Discoteca', 'Concerto', 'Festival', 'Altro'];
const statusLabels = { active: 'Attiva', sold: 'Venduta', expired: 'Scaduta', cancelled: 'Cancellata' };

export default function EditResalePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [screenshotFiles, setScreenshotFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
  });

  useEffect(() => {
    const fetchResale = async () => {
      try {
        const { data } = await resaleService.getById(id);
        const r = data?.resale || data?.data?.resale || data;
        if (!r) throw new Error('Annuncio non trovato');

        if (r.seller?._id !== user?._id) {
          alert('Non autorizzato a modificare questo annuncio');
          navigate('/resales');
          return;
        }

        if (r.status !== 'active') {
          alert('Puoi modificare solo annunci attivi');
          navigate('/my-resales');
          return;
        }

        const cat = categories.find(c => c.toLowerCase() === r.category?.toLowerCase()) || r.category || '';
        setForm({
          eventName: r.eventName || '',
          category: cat,
          eventDate: r.eventDate ? r.eventDate.split('T')[0] : '',
          eventTime: r.eventTime || '',
          city: r.city || '',
          location: r.location || '',
          originalPrice: r.originalPrice ?? '',
          askingPrice: r.askingPrice ?? '',
          quantity: r.quantity ?? 1,
          description: r.description || '',
        });
        setExistingImages(r.images || []);
      } catch (err) {
        alert(err?.response?.data?.message || err.message || 'Errore nel caricamento');
        navigate('/my-resales');
      } finally {
        setFetching(false);
      }
    };
    fetchResale();
  }, [id]);

  const handleFileChange = (e) => {
    setScreenshotFiles(Array.from(e.target.files));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
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

    existingImages.forEach((url) => fd.append('existingImages', url));

    screenshotFiles.forEach((file) => fd.append('screenshots', file));

    setLoading(true);
    try {
      await resaleService.update(id, fd);
      navigate(`/resales/${id}`);
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Errore durante l\'aggiornamento');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>Modifica Prevendita</h2>

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

        <label style={styles.label}>Immagini Esistenti</label>
        {existingImages.length === 0 && (
          <p style={{ color: colors.textHint, fontSize: 13, marginBottom: 8 }}>Nessuna immagine salvata</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {existingImages.map((url, i) => (
            <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(i)}
                style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: 'none', background: colors.error, color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <label style={styles.label}>Aggiungi Nuove Foto</label>
        <input
          style={styles.input}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        {screenshotFiles.length > 0 && (
          <p style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
            {screenshotFiles.length} nuovi file selezionati
          </p>
        )}

        <button style={styles.btn} disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva Modifiche'}
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
