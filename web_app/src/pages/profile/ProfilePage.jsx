import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { reviewService } from '../../services/reviewService';
import { colors } from '../../config/theme';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import BadgeRow from '../../components/BadgeRow';
import useLocationTracker from '../../hooks/useLocationTracker';
import { authService } from '../../services/authService';
import InstallCard from '../../components/InstallCard';
 
export default function ProfilePage() {
  const { user, logout, updateProfile, uploadPhoto } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bio: '', dateOfBirth: '' });
  const [nearbyAlerts, setNearbyAlerts] = useState(user?.nearbyAlerts || false);

  useLocationTracker(nearbyAlerts);

  useEffect(() => {
    if (user) {
      setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, bio: user.bio || '', dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '' });
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      const res = await reviewService.getUserReviews(user?._id);
      setReviews(res.data.reviews);
      setStats(res.data.stats);
    } catch {}
    finally { setLoading(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await uploadPhoto(formData);
    } catch (err) { alert(err.message); }
  };

  const handleSave = async () => {
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) { alert(err.message); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleNearbyAlerts = async () => {
    const next = !nearbyAlerts;
    try {
      await authService.toggleNearbyAlerts(next);
      setNearbyAlerts(next);
    } catch (err) { alert(err.message); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={styles.profileHeader}>
        <label style={{ cursor: 'pointer', display: 'inline-block' }}>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          {user?.profilePhoto && !user.profilePhoto.includes('default-avatar') ? (
            <img src={user.profilePhoto} alt="" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatar}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          )}
          <div style={styles.cameraBadge}>📷</div>
        </label>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 4px' }}>{user?.firstName} {user?.lastName}</h2>
        {stats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating rating={stats.averageRating || user?.rating || 0} />
            <span style={{ fontSize: 13, color: colors.textSecondary }}>({stats.totalReviews || user?.totalReviews || 0} recensioni)</span>
          </div>
        )}
        <div style={styles.statsRow}>
          <div style={styles.stat}><span style={{ fontWeight: 700, fontSize: 18 }}>{user?.totalRidesAsDriver || 0}</span><span style={styles.statLabel}>Passaggi</span></div>
          <div style={styles.stat}><span style={{ fontWeight: 700, fontSize: 18 }}>{user?.totalRidesAsPassenger || 0}</span><span style={styles.statLabel}>Viaggi</span></div>
        </div>
        <div style={{ marginTop: 12 }}>
          <BadgeRow badges={user?.badges} size="large" />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>⚡ Notifiche Al Volo</h3>
          <label style={styles.toggle}>
            <input type="checkbox" checked={nearbyAlerts} onChange={toggleNearbyAlerts} style={{ display: 'none' }} />
            <div style={{ ...styles.toggleTrack, background: nearbyAlerts ? colors.primary : colors.textMuted }}>
              <div style={{ ...styles.toggleThumb, transform: nearbyAlerts ? 'translateX(18px)' : 'translateX(2px)' }} />
            </div>
          </label>
        </div>
        <p style={{ fontSize: 12, color: colors.textHint, margin: 0 }}>
          {nearbyAlerts
            ? '✅ Riceverai notifiche quando un passaggio parte vicino a te. La tua posizione viene aggiornata periodicamente.'
            : 'Attiva per ricevere notifiche in tempo reale quando qualcuno pubblica un passaggio nella tua zona.'}
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Informazioni</h3>
          <button style={styles.editBtn} onClick={() => setEditing(!editing)}>{editing ? '✕' : '✏️'}</button>
        </div>
        {editing ? (
          <div>
            <div style={styles.row}>
              <input style={styles.input} placeholder="Nome" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              <input style={styles.input} placeholder="Cognome" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <input style={styles.input} placeholder="Telefono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <label style={{ display: 'block', fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>Data di nascita</label>
            <input type="date" style={styles.input} value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
            <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} placeholder="Bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
            <button style={styles.saveBtn} onClick={handleSave}>Salva</button>
          </div>
        ) : (
          <div>
            <div style={styles.infoRow}><span>Email</span><span>{user?.email}</span></div>
            <div style={styles.infoRow}><span>Telefono</span><span>{user?.phone}</span></div>
            <div style={styles.infoRow}><span>Età</span><span>{user?.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : '-'} anni</span></div>
            {user?.bio && <div style={styles.infoRow}><span>Bio</span><span>{user.bio}</span></div>}
          </div>
        )}
      </div>

      <div style={styles.menuSection}>
        <div style={styles.menuItem} onClick={() => navigate('/my-rides')}>
          <span>🛣️ I miei passaggi</span>
          <span style={styles.arrow}>›</span>
        </div>
        <div style={styles.menuItem} onClick={() => navigate('/bookings')}>
          <span>📋 Prenotazioni</span>
          <span style={styles.arrow}>›</span>
        </div>
        <div style={styles.menuItem} onClick={() => navigate('/my-resales')}>
          <span>🎟️ Le mie prevendite</span>
          <span style={styles.arrow}>›</span>
        </div>
        <div style={styles.menuItem} onClick={() => navigate('/notifications')}>
          <span>🔔 Notifiche</span>
          <span style={styles.arrow}>›</span>
        </div>
        <div style={{ ...styles.menuItem, color: user?.isPhoneVerified ? colors.success : colors.warning }} onClick={() => navigate('/verify-phone')}>
          <span>{user?.isPhoneVerified ? '✅ Account verificato' : '📧 Verifica account'}</span>
          <span style={styles.arrow}>›</span>
        </div>
      </div>

      <InstallCard />

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recensioni Ricevute</h3>
        {reviews.length === 0 && <p style={{ color: colors.textSecondary, fontSize: 13 }}>Nessuna recensione ancora</p>}
        {reviews.map(review => (
          <div key={review._id} style={styles.reviewCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={styles.reviewAvatar}>{review.reviewer?.firstName?.[0]}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{review.reviewer?.firstName} {review.reviewer?.lastName}</div>
                <StarRating rating={review.overallRating} size={12} />
              </div>
            </div>
            {review.comment && <p style={{ fontSize: 13, color: colors.textSecondary, margin: 0 }}>{review.comment}</p>}
            {review.response?.text && (
              <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: colors.surface, fontSize: 12, color: colors.textSecondary }}>
                <strong>Risposta:</strong> {review.response.text}
              </div>
            )}
            {review.positiveTags?.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {review.positiveTags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>

      <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
    </div>
  );
}

const styles = {
  profileHeader: { textAlign: 'center', padding: '24px 0' },
  avatar: { width: 80, height: 80, borderRadius: 40, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 28, fontWeight: 700 },
  avatarImg: { width: 80, height: 80, borderRadius: 40, objectFit: 'cover', display: 'block', margin: '0 auto' },
  cameraBadge: { position: 'relative', marginTop: -20, fontSize: 18, textAlign: 'center', pointerEvents: 'none' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16 },
  stat: { textAlign: 'center' },
  statLabel: { display: 'block', fontSize: 11, color: colors.textHint },
  section: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 16 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 600, margin: 0 },
  editBtn: { background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: 16 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: `1px solid ${colors.textHint}11` },
  row: { display: 'flex', gap: 8 },
  input: { width: '100%', padding: '10px 12px', marginBottom: 8, border: 'none', borderRadius: 8, background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: 10, border: 'none', borderRadius: 8, background: colors.primary, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  menuSection: { padding: 16, borderRadius: 12, background: colors.card, marginBottom: 16 },
  menuItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', cursor: 'pointer', borderBottom: `1px solid ${colors.textHint}11` },
  arrow: { fontSize: 20, color: colors.textHint },
  reviewCard: { padding: 12, borderRadius: 10, background: colors.surface, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, background: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 },
  tag: { padding: '2px 8px', borderRadius: 8, fontSize: 11, background: `${colors.primary}22`, color: colors.primary },
  logoutBtn: { width: '100%', padding: 14, border: `1px solid ${colors.error}`, borderRadius: 12, background: 'transparent', color: colors.error, fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 8, marginBottom: 24 },
  toggle: { cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  toggleTrack: { width: 40, height: 24, borderRadius: 12, padding: 2, transition: 'background 0.2s', display: 'flex', alignItems: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
};
