import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRides } from '../../contexts/RideContext';
import { colors } from '../../config/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import VerifiedBadge from '../../components/VerifiedBadge';

export default function MyRidesPage() {
  const { myRides, loading, getMyRidesAsDriver, cancelRide } = useRides();
  const navigate = useNavigate();

  useEffect(() => { getMyRidesAsDriver(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>I Miei Passaggi (Driver)</h2>
      {myRides.length === 0 && <p style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>Nessun passaggio pubblicato</p>}
      {myRides.map(ride => (
        <div key={ride._id} style={styles.card} onClick={() => navigate(`/rides/${ride._id}`)}>
          <div style={styles.header}>
            <span style={{ fontWeight: 600 }}>{ride.spontaneous ? '⚡ ' : '🎵 '}{ride.destination?.name}</span>
            <span style={{ color: ride.status === 'attivo' ? colors.success : colors.textHint, fontSize: 12 }}>
              {ride.status === 'attivo' ? 'Attivo' : ride.status}
            </span>
          </div>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>
            🕐 {new Date(ride.departure?.dateTime).toLocaleString('it-IT')}
          </div>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>
            📍 {ride.departure?.address} → {ride.destination?.address}
          </div>
          <div style={{ fontSize: 13, color: colors.textSecondary }}>
            {ride.spontaneous ? (
              <>⚡ Spontaneo • 👥 {ride.bookedSeats}/{ride.availableSeats} posti • 💰 Da concordare</>
            ) : (
              <>🚗 {ride.carBrand} {ride.carModel} • 👥 {ride.bookedSeats}/{ride.availableSeats} posti • 💰 {ride.pricePerSeat}€</>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={styles.btn} onClick={(e) => { e.stopPropagation(); navigate(`/rides/${ride._id}`); }}>🔍 Dettagli</button>
            {ride.status === 'attivo' && (
              <button style={{ ...styles.btn, color: colors.error, borderColor: colors.error }} onClick={async (e) => { e.stopPropagation(); if (confirm('Cancellare questo passaggio?')) { try { await cancelRide(ride._id); } catch (err) { alert(err.message); } } }}>
                🗑️ Cancella
              </button>
            )}
          </div>
          {ride.bookings?.length > 0 && (
            <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: colors.surface }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Prenotazioni ({ride.bookings.length})</div>
              {ride.bookings.map(b => (
                <div key={b._id} style={{ fontSize: 12, color: colors.textSecondary, display: 'flex', justifyContent: 'space-between' }}>
                  <span>👤 {b.passenger?.firstName} {b.passenger?.lastName}{b.passenger?.isPhoneVerified && <VerifiedBadge size={10} />}</span>
                  <span>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 12, cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  btn: { padding: '6px 14px', borderRadius: 8, border: `1px solid ${colors.textHint}44`, background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: 12 },
};
