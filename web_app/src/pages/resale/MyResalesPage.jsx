import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { resaleService } from '../../services/resaleService';
import { colors } from '../../config/theme';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusTabs = [
  { key: 'active', label: 'Attive' },
  { key: 'sold', label: 'Vendute' },
  { key: 'expired', label: 'Scadute' },
];

const statusColors = { active: '#4CAF50', sold: '#2196F3', expired: '#666' };
const statusLabels = { active: 'Attiva', sold: 'Venduta', expired: 'Scaduta' };

export default function MyResalesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('active');
  const [resales, setResales] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResales = async (status) => {
    setLoading(true);
    try {
      const { data } = await resaleService.getMyResales({ status });
      setResales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await resaleService.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'requests') {
      fetchRequests();
    } else {
      fetchResales(tab);
    }
  }, [tab]);

  const handleMarkAsSold = async (id) => {
    if (!confirm('Confermi di aver venduto questo biglietto?')) return;
    try {
      await resaleService.markAsSold(id);
      fetchResales(tab);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo annuncio?')) return;
    try {
      await resaleService.delete(id);
      fetchResales(tab);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={styles.tabs}>
        {statusTabs.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tab, borderBottom: tab === t.key ? `2px solid ${colors.primary}` : '2px solid transparent', color: tab === t.key ? colors.primary : colors.textSecondary }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
        <button
          style={{ ...styles.tab, borderBottom: tab === 'requests' ? `2px solid ${colors.primary}` : '2px solid transparent', color: tab === 'requests' ? colors.primary : colors.textSecondary }}
          onClick={() => setTab('requests')}
        >
          Richieste
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && tab === 'requests' && requests.length === 0 && (
        <p style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Nessuna richiesta</p>
      )}

      {!loading && tab !== 'requests' && resales.length === 0 && (
        <p style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Nessun annuncio</p>
      )}

      {/* Resales */}
      {!loading && tab !== 'requests' && resales.map(item => (
        <div key={item._id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{item.event?.name || 'Evento'}</div>
            <div style={{ color: statusColors[item.status] || colors.textSecondary, fontSize: 13, fontWeight: 600 }}>
              {statusLabels[item.status] || item.status}
            </div>
          </div>

          <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            🗓️ {new Date(item.date || item.event?.date).toLocaleDateString('it-IT')}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13 }}>
            <span style={{ color: colors.textHint }}>💰 {item.askingPrice}€</span>
            <span style={{ color: colors.textHint }}>🎟️ Q.tà: {item.quantity || 1}</span>
          </div>

          {item.status === 'active' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...styles.actionBtn, background: colors.primary }} onClick={() => navigate(`/resales/edit/${item._id}`)}>Modifica</button>
              <button style={{ ...styles.actionBtn, background: colors.success }} onClick={() => handleMarkAsSold(item._id)}>Venduto</button>
              <button style={{ ...styles.actionBtn, background: colors.error }} onClick={() => handleDelete(item._id)}>Elimina</button>
            </div>
          )}
        </div>
      ))}

      {/* Requests */}
      {!loading && tab === 'requests' && requests.map(req => (
        <div key={req._id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{req.resale?.event?.name || 'Evento'}</div>
          </div>

          <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            🗓️ Richiesto il {new Date(req.contactedAt).toLocaleDateString('it-IT')}
          </div>

          {req.resale?.askingPrice && (
            <div style={{ fontSize: 13, color: colors.textHint, marginTop: 4 }}>
              💰 Prezzo: {req.resale.askingPrice}€
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  tabs: { display: 'flex', marginBottom: 16 },
  tab: { flex: 1, padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  card: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 12 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  actionBtn: { padding: '8px 16px', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
};
