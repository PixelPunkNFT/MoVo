import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../contexts/BookingContext';
import { reviewService } from '../../services/reviewService';
import { colors } from '../../config/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import VerifiedBadge from '../../components/VerifiedBadge';

function ReviewModal({ booking, fromTab, onClose }) {
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);

  const reviewType = fromTab === 'my' ? 'driver' : 'passenger';

  const handleSubmit = async () => {
    setSending(true);
    try {
      await reviewService.addReview(booking._id, { overallRating, comment, reviewType });
      alert('Recensione pubblicata!');
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 12px' }}>Lascia una Recensione</h3>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, marginBottom: 6, color: colors.textSecondary }}>Valutazione</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} style={{ ...styles.star, background: n <= overallRating ? colors.primary : colors.surface }} onClick={() => setOverallRating(n)}>{n}★</button>
            ))}
          </div>
        </div>
        <textarea style={styles.textarea} placeholder="Commento (opzionale)" value={comment} onChange={e => setComment(e.target.value)} maxLength={500} rows={4} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={{ ...styles.btn, flex: 1 }} disabled={sending} onClick={handleSubmit}>{sending ? 'Invio...' : 'Pubblica'}</button>
          <button style={{ ...styles.btn, flex: 1, background: colors.textHint }} onClick={onClose}>Annulla</button>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { myBookings, receivedBookings, loading, getMyBookings, getReceivedBookings, confirmBooking, rejectBooking, completeBooking, cancelBooking } = useBookings();
  const [tab, setTab] = useState('my');
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewTab, setReviewTab] = useState('my');
  const navigate = useNavigate();

  useEffect(() => { getMyBookings(); getReceivedBookings(); }, []);

  const getStatusStyle = (status) => {
    const map = { pending: colors.warning, confermato: colors.success, completato: colors.info, rifiutato: colors.error, cancellato: colors.textHint };
    return { color: map[status] || colors.textSecondary };
  };

  const list = tab === 'my' ? myBookings : receivedBookings;

  return (
    <div>
      {reviewBooking && <ReviewModal booking={reviewBooking} fromTab={reviewTab} onClose={() => setReviewBooking(null)} />}

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, borderBottom: tab === 'my' ? `2px solid ${colors.primary}` : '2px solid transparent', color: tab === 'my' ? colors.primary : colors.textSecondary }} onClick={() => setTab('my')}>Le Mie Prenotazioni</button>
        <button style={{ ...styles.tab, borderBottom: tab === 'received' ? `2px solid ${colors.primary}` : '2px solid transparent', color: tab === 'received' ? colors.primary : colors.textSecondary }} onClick={() => setTab('received')}>Ricevute ({receivedBookings.filter(b => b.status === 'pending').length})</button>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && list.length === 0 && <p style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Nessuna prenotazione</p>}

      {list.map(booking => (
        <div key={booking._id} style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              {tab === 'my' ? (
                <span>👤 {booking.driver?.firstName} {booking.driver?.lastName}{booking.driver?.isPhoneVerified && <VerifiedBadge size={12} />}</span>
              ) : (
                <span>👤 {booking.passenger?.firstName} {booking.passenger?.lastName}{booking.passenger?.isPhoneVerified && <VerifiedBadge size={12} />}</span>
              )}
            </div>
            <div style={getStatusStyle(booking.status)}>
              {booking.status === 'pending' && 'In attesa'}
              {booking.status === 'confermato' && 'Confermato'}
              {booking.status === 'completato' && 'Completato'}
              {booking.status === 'rifiutato' && 'Rifiutato'}
              {booking.status === 'cancellato' && 'Cancellato'}
            </div>
          </div>
          <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            🗓️ {new Date(booking.ride?.departure?.dateTime).toLocaleString('it-IT')} • 🚗 {booking.seatsBooked} posto{booking.seatsBooked > 1 ? 'i' : ''} • 💰 {booking.totalPrice}€
          </div>
          <div style={{ fontSize: 12, color: colors.textHint }}>
            🎵 {booking.ride?.destination?.name} • 📍 {booking.ride?.departure?.address}
          </div>

          {/* Driver: accept/reject pending */}
          {tab === 'received' && booking.status === 'pending' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button style={{ ...styles.actionBtn, background: colors.success }} onClick={() => confirmBooking(booking._id)}>Conferma</button>
              <button style={{ ...styles.actionBtn, background: colors.error }} onClick={() => { const r = prompt('Motivo del rifiuto:'); if (r) rejectBooking(booking._id, r); }}>Rifiuta</button>
            </div>
          )}

          {/* Both: complete when confirmed */}
          {booking.status === 'confermato' && (
            <button style={{ ...styles.actionBtn, background: colors.info, marginTop: 12, width: '100%' }} onClick={() => { if (confirm('Confermi di aver completato il viaggio?')) completeBooking(booking._id); }}>Completa Viaggio</button>
          )}

          {/* Both: leave review when completed */}
          {booking.status === 'completato' && !booking.review && (
            <button style={{ ...styles.actionBtn, background: colors.primary, marginTop: 12, width: '100%' }} onClick={() => { setReviewTab(tab); setReviewBooking(booking); }}>Lascia Recensione</button>
          )}

          {/* Passenger: cancel when pending/confirmed */}
          {tab === 'my' && (booking.status === 'pending' || booking.status === 'confermato') && (
            <button style={{ ...styles.actionBtn, background: colors.error, marginTop: 12 }} onClick={() => { const r = prompt('Motivo della cancellazione:'); cancelBooking(booking._id, r); }}>Cancella Prenotazione</button>
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
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 600 },
  actionBtn: { padding: '8px 16px', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: colors.card, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  star: { padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, color: '#fff' },
  textarea: { width: '100%', padding: 12, border: 'none', borderRadius: 8, background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' },
  btn: { padding: '10px', border: 'none', borderRadius: 8, background: colors.primary, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
};
