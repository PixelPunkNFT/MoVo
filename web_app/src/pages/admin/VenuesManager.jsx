import { useState, useEffect } from 'react';
import { venueService } from '../../services/venueService';
import { colors } from '../../config/theme';

const musicOptions = ['salsa', 'bachata', 'reggaeton', 'merengue', 'kizomba', 'latin pop', 'latino', 'altro'];

export default function VenuesManager() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', city: 'Roma', type: 'Club Latino', music: [], description: '', website: '', phone: '' });

  const loadVenues = async () => {
    try { const r = await venueService.getAll(); setVenues(r.data.venues); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadVenues(); }, []);

  const resetForm = () => {
    setForm({ name: '', address: '', city: 'Roma', type: 'Club Latino', music: [], description: '', website: '', phone: '' });
    setEditId(null); setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) { await venueService.update(editId, form); }
      else { await venueService.create(form); }
      resetForm(); loadVenues();
    } catch (err) { alert(err.message); }
  };

  const handleEdit = (v) => {
    setForm({ name: v.name, address: v.address, city: v.city, type: v.type, music: v.music || [], description: v.description || '', website: v.website || '', phone: v.phone || '' });
    setEditId(v._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Disattivare questo locale?')) return;
    try { await venueService.delete(id); loadVenues(); }
    catch (err) { alert(err.message); }
  };

  const toggleMusic = (genre) => {
    setForm(prev => ({
      ...prev,
      music: prev.music.includes(genre)
        ? prev.music.filter(m => m !== genre)
        : [...prev.music, genre]
    }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Locali ({venues.length})</h3>
        <button style={styles.addBtn} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕' : '+ Nuovo Locale'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>{editId ? 'Modifica' : 'Nuovo'} Locale</h4>
          <input style={styles.input} placeholder="Nome locale *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={styles.input} placeholder="Indirizzo *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...styles.input, flex: 1 }} placeholder="Città" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <input style={{ ...styles.input, flex: 1 }} placeholder="Tipo (es: Club Latino)" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Generi musicali:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {musicOptions.map(g => (
                <button key={g} type="button" style={{
                  padding: '4px 10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 11,
                  background: form.music.includes(g) ? colors.primary : colors.surface, color: '#fff',
                }} onClick={() => toggleMusic(g)}>{g}</button>
              ))}
            </div>
          </div>
          <textarea style={{ ...styles.input, minHeight: 60, resize: 'vertical' }} placeholder="Descrizione" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...styles.input, flex: 1 }} placeholder="Sito web" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            <input style={{ ...styles.input, flex: 1 }} placeholder="Telefono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...styles.btn, flex: 1 }} type="submit">{editId ? 'Salva' : 'Crea'}</button>
            <button style={{ ...styles.btn, flex: 1, background: colors.textHint }} type="button" onClick={resetForm}>Annulla</button>
          </div>
        </form>
      )}

      {!loading && venues.length === 0 && <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 20 }}>Nessun locale. Creane uno!</p>}

      {venues.map(v => (
        <div key={v._id} style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>📍 {v.address}</div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>🎵 {v.music?.join(', ')} • {v.type}</div>
              {v.description && <div style={{ fontSize: 12, color: colors.textHint, marginTop: 4 }}>{v.description}</div>}
              {v.website && <div style={{ fontSize: 12, color: colors.primary }}>🌐 {v.website}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button style={styles.actionBtn} onClick={() => handleEdit(v)}>✏️ Modifica</button>
            <button style={{ ...styles.actionBtn, color: colors.error, borderColor: colors.error }} onClick={() => handleDelete(v._id)}>🗑️ Elimina</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  addBtn: { padding: '8px 16px', borderRadius: 20, border: 'none', background: colors.primary, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  form: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 16 },
  input: { width: '100%', padding: '10px 12px', marginBottom: 8, border: 'none', borderRadius: 8, background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '10px', border: 'none', borderRadius: 8, background: colors.primary, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  card: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 12 },
  actionBtn: { padding: '5px 12px', borderRadius: 8, border: `1px solid ${colors.textHint}44`, background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: 11 },
};
