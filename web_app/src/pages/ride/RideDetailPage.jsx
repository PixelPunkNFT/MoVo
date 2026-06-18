import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRides } from '../../contexts/RideContext';
import { useBookings } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../config/theme';
import { useChats } from '../../contexts/ChatContext';
import { reviewService } from '../../services/reviewService';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import VerifiedBadge from '../../components/VerifiedBadge';
import { shareWhatsApp } from '../../utils/share';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import BadgeRow from '../../components/BadgeRow';
 
export default function RideDetailPage() {
  const { id } = useParams();
  const { getRideById } = useRides();
  const { bookRide } = useBookings();
  const { createChat } = useChats();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [driverReviews, setDriverReviews] = useState([]);

  useEffect(() => {
    getRideById(id).then(r => {
      setRide(r);
      if (r.driver?._id) {
        reviewService.getUserReviews(r.driver._id).then(res => setDriverReviews(res.data.reviews || [])).catch(() => {});
      }
    }).catch(() => navigate('/search')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!ride) return <p style={{ color: colors.textSecondary, textAlign: 'center' }}>Passaggio non trovato</p>;

  const isDriver = user?._id === ride.driver?._id;

  const { joinSpontaneousRide } = useRides();

  const handleBook = async () => {
    setBooking(true);
    try {
      await bookRide(id, { seatsBooked: seats });
      alert('Prenotazione effettuata con successo!');
      navigate('/bookings');
    } catch (err) { alert(err.message); }
    finally { setBooking(false); }
  };

  const handleJoinSpontaneous = async () => {
    setBooking(true);
    try {
      const { chat } = await joinSpontaneousRide(id);
      navigate(`/chats/${chat._id}`);
    } catch (err) { alert(err.message); }
    finally { setBooking(false); }
  };

  const handleContact = async () => {
    try {
      const chat = await createChat(ride.driver._id, id);
      navigate(`/chats/${chat._id}`);
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      {ride.spontaneous && <div style={styles.spontHeader}>⚡ Passaggio Spontaneo</div>}
        <div style={styles.driverSection}>
          {ride.driver?.profilePhoto && !ride.driver.profilePhoto.includes('default-avatar')
            ? <img src={ride.driver.profilePhoto} alt="" style={styles.avatarImg} />
            : <div style={styles.avatar}>{ride.driver?.firstName?.[0]}</div>}
        <div style={{ flex: 1 }}>
          <div style={styles.driverName}>{ride.driver?.firstName} {ride.driver?.lastName}{ride.driver?.isPhoneVerified && <VerifiedBadge size={14} />}</div>
          <StarRating rating={ride.driver?.rating || 0} />
          <BadgeRow badges={ride.driver?.badges} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={styles.shareBtn} onClick={() => shareWhatsApp(ride)} title="Condividi su WhatsApp"><WhatsAppIcon size={16} /></button>
          <button style={styles.contactBtn} onClick={handleContact}>💬 Contatta</button>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Partenza</h3>
        <p>📍 {ride.spontaneous ? 'Da concordare' : `${ride.departure?.address}, ${ride.departure?.city}`}</p>
        <p>🕐 {new Date(ride.departure?.dateTime).toLocaleString('it-IT')}</p>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Destinazione</h3>
        <p>🎵 <strong>{ride.destination?.name}</strong></p>
        <p>{ride.destination?.address}</p>
      </div>

      {!ride.spontaneous && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Veicolo</h3>
          <p>🚗 {ride.carBrand} {ride.carModel} - {ride.carColor}</p>
          {isDriver && <p>🔢 Targa: {ride.plateNumber}</p>}
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Dettagli</h3>
        {ride.spontaneous ? (
          <>
            <div style={styles.detailRow}><span>Prezzo</span><span style={{ color: colors.textHint }}>Da concordare</span></div>
            <div style={styles.detailRow}><span>Posti disponibili</span><span>{ride.remainingSeats}/{ride.availableSeats}</span></div>
            <div style={styles.detailRow}><span>Tipo</span><span style={{ color: colors.gold }}>⚡ Spontaneo</span></div>
          </>
        ) : (
          <>
            <div style={styles.detailRow}><span>Prezzo</span><span style={{ color: colors.primary, fontWeight: 700 }}>{ride.pricePerSeat}€ /posto</span></div>
            <div style={styles.detailRow}><span>Posti disponibili</span><span>{ride.remainingSeats}/{ride.availableSeats}</span></div>
            <div style={styles.detailRow}><span>Distanza</span><span>{ride.distance} km</span></div>
            <div style={styles.detailRow}><span>Durata</span><span>{ride.estimatedDuration} min</span></div>
            {ride.preferences?.musicType && ride.preferences.musicType !== 'nessuna' && (
              <div style={styles.detailRow}><span>Musica</span><span>🎵 {ride.preferences.musicType}</span></div>
            )}
          </>
        )}
      </div>

      {!isDriver && ride.status === 'attivo' && ride.remainingSeats > 0 && (
        ride.spontaneous ? (
          <div style={styles.bookSection}>
            <button style={styles.bookBtn} onClick={handleJoinSpontaneous} disabled={booking}>
              {booking ? 'Unione...' : '⚡ Unisciti al gruppo'}
            </button>
          </div>
        ) : (
          <div style={styles.bookSection}>
            <div style={styles.seatSelector}>
              <button style={styles.seatBtn} onClick={() => setSeats(Math.max(1, seats - 1))}>-</button>
              <span style={styles.seatCount}>{seats} posto{seats > 1 ? 'i' : ''}</span>
              <button style={styles.seatBtn} onClick={() => setSeats(Math.min(4, ride.remainingSeats, seats + 1))}>+</button>
            </div>
            <div style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>
              Totale: <strong style={{ color: colors.primary }}>{seats * ride.pricePerSeat}€</strong>
            </div>
            <button style={styles.bookBtn} onClick={handleBook} disabled={booking}>
              {booking ? 'Prenotazione...' : 'Prenota Ora'}
            </button>
          </div>
        )
      )}

      {ride.notes && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Note</h3>
          <p style={{ color: colors.textSecondary, fontSize: 13 }}>{ride.notes}</p>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recensioni del conducente</h3>
        {driverReviews.length === 0 && <p style={{ color: colors.textSecondary, fontSize: 13 }}>Nessuna recensione ancora</p>}
        {driverReviews.slice(0, 5).map(review => (
          <div key={review._id} style={{ padding: '10px 0', borderBottom: `1px solid ${colors.textHint}11` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                {review.reviewer?.firstName?.[0] || '?'}
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{review.reviewer?.firstName}</span>
                <StarRating rating={review.overallRating} size={11} />
              </div>
            </div>
            {review.comment && <p style={{ fontSize: 12, color: colors.textSecondary, margin: '2px 0 0' }}>{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  spontHeader: {
    textAlign: 'center', padding: '8px 0', marginBottom: 12,
    fontSize: 13, fontWeight: 700, color: colors.gold,
    background: 'rgba(212,175,55,0.1)', borderRadius: 10,
    border: `1px solid ${colors.goldGlow}`,
  },
  driverSection: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, background: colors.card, padding: 16, borderRadius: 12 },
  avatarImg: { width: 48, height: 48, borderRadius: 24, objectFit: 'cover' },
  avatar: { width: 48, height: 48, borderRadius: 24, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 },
  driverName: { fontSize: 16, fontWeight: 600 },
  contactBtn: { padding: '8px 16px', borderRadius: 20, border: `1px solid ${colors.primary}`, background: 'transparent', color: colors.primary, cursor: 'pointer', fontSize: 13 },
  shareBtn: { padding: '8px 12px', borderRadius: 20, border: 'none', background: colors.whatsapp, color: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1 },
  card: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 600, margin: '0 0 8px', color: colors.textSecondary },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14 },
  bookSection: { padding: 16, borderRadius: 12, background: colors.card, marginTop: 12 },
  seatSelector: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 8 },
  seatBtn: { width: 40, height: 40, borderRadius: 20, border: `1px solid ${colors.textHint}44`, background: colors.surface, color: colors.textPrimary, fontSize: 20, cursor: 'pointer' },
  seatCount: { fontSize: 18, fontWeight: 600, minWidth: 80, textAlign: 'center' },
  bookBtn: { width: '100%', padding: 14, border: 'none', borderRadius: 12, background: colors.primary, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
};
