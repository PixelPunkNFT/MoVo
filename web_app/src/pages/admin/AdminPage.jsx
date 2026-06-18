import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { colors } from '../../config/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import VenuesManager from './VenuesManager';

function StatsCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 120, padding: 16, borderRadius: 12, background: colors.card, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || colors.primary }}>{value}</div>
      <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function TabButton({ active, label, onClick }) {
  return (
    <button
      style={{
        padding: '10px 16px', border: 'none', borderBottom: active ? `2px solid ${colors.primary}` : '2px solid transparent',
        background: 'transparent', color: active ? colors.primary : colors.textSecondary, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
      }}
      onClick={onClick}
    >{label}</button>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logFilter, setLogFilter] = useState({ category: '', action: '', search: '' });
  const [logCategories, setLogCategories] = useState([]);
  const [logActions, setLogActions] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => { loadStats(); loadUsers(); loadRides(); loadBookings(); loadReviews(); loadLogs(); }, []);

  const loadStats = async () => { try { const r = await adminService.getStats(); setStats(r.data); } catch {} finally { setLoading(false); } };
  const loadUsers = async (search) => { try { const r = await adminService.getUsers({ search }); setUsers(r.data.users); } catch {} };
  const loadRides = async () => { try { const r = await adminService.getRides(); setRides(r.data.rides); } catch {} };
  const loadBookings = async () => { try { const r = await adminService.getBookings(); setBookings(r.data.bookings); } catch {} };
  const loadReviews = async () => { try { const r = await adminService.getReportedReviews(); setReviews(r.data.reviews); } catch {} };
  const loadLogs = async (page = 1) => {
    try {
      const params = { page, limit: 50, ...logFilter };
      if (!params.category) delete params.category;
      if (!params.action) delete params.action;
      if (!params.search) delete params.search;
      const r = await adminService.getLogs(params);
      setLogs(r.data.logs);
      setLogTotal(r.data.total);
      setLogPage(r.data.page);
      setLogTotalPages(r.data.totalPages);
      setLogCategories(r.data.categories);
      setLogActions(r.data.actions);
    } catch {}
  };

  const handleBan = async (id) => {
    if (!confirm('Confermi di voler sospendere/riattivare questo utente?')) return;
    try { await adminService.toggleBan(id); loadUsers(userSearch); } catch (err) { alert(err.message); }
  };

  const handleVerify = async (id, verified) => {
    try { await adminService.verifyUser(id, verified); loadUsers(userSearch); } catch (err) { alert(err.message); }
  };

  const handleMakeAdmin = async (id) => {
    if (!confirm('Confermi di voler rendere questo utente amministratore?')) return;
    try { await adminService.makeAdmin(id); loadUsers(userSearch); } catch (err) { alert(err.message); }
  };

  const handleCancelRide = async (id) => {
    if (!confirm('Confermi di cancellare questo passaggio?')) return;
    try { await adminService.cancelRide(id); loadRides(); } catch (err) { alert(err.message); }
  };

  const handleToggleReview = async (id) => {
    try { await adminService.toggleReviewVisibility(id); loadReviews(); } catch (err) { alert(err.message); }
  };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Utenti' },
    { key: 'rides', label: 'Passaggi' },
    { key: 'bookings', label: 'Prenotazioni' },
    { key: 'reviews', label: 'Recensioni' },
    { key: 'venues', label: 'Locali' },
    { key: 'logs', label: '📋 Log' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Pannello Admin</h2>
        <button
          style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${colors.textHint}44`, background: 'transparent', color: colors.textSecondary, cursor: 'pointer', fontSize: 12 }}
          onClick={() => navigate('/home')}
        >← Torna all'app</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => <TabButton key={t.key} active={tab === t.key} label={t.label} onClick={() => setTab(t.key)} />)}
      </div>

      {loading && <LoadingSpinner />}

      {tab === 'dashboard' && stats && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <StatsCard label="Utenti Totali" value={stats.totalUsers} color={colors.info} />
            <StatsCard label="Autisti" value={stats.totalDrivers} color={colors.primary} />
            <StatsCard label="Passaggi" value={stats.totalRides} color={colors.success} />
            <StatsCard label="Prenotazioni" value={stats.totalBookings} color={colors.warning} />
            <StatsCard label="Recensioni" value={stats.totalReviews} color={colors.accent} />
            <StatsCard label="Utenti Online" value={stats.activeUsers} color={colors.success} />
            <StatsCard label="Pren. In Attesa" value={stats.pendingBookings} color={colors.error} />
            <StatsCard label="Ricavi Totali" value={`${stats.totalRevenue}€`} color={colors.primary} />
          </div>
          {stats.ridesByStatus && (
            <div style={{ padding: 16, borderRadius: 12, background: colors.card }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Stato Passaggi</h3>
              <div style={{ display: 'flex', gap: 16 }}>
                {Object.entries(stats.ridesByStatus).map(([status, count]) => (
                  <div key={status} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
                    <div style={{ fontSize: 11, color: colors.textHint, textTransform: 'capitalize' }}>{status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <input style={styles.searchInput} placeholder="Cerca utenti per nome, email o telefono..." value={userSearch}
            onChange={e => { setUserSearch(e.target.value); loadUsers(e.target.value); }} />
          {users.map(u => (
            <div key={u._id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName} {u.role === 'admin' && <span style={styles.adminBadge}>Admin</span>}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>📧 {u.email} • 📞 {u.phone}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    🚗 {u.vehicles?.length || 0} veicoli • ★ {u.rating?.toFixed(1) || '0.0'} • 🏷️ {u.role}
                  </div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>
                    {u.isActive ? '✅ Attivo' : '⛔ Sospeso'} • {u.isIDVerified ? '🆔 Verificato' : '🆔 Non verificato'} • {u.isEmailVerified ? '📧 Verificata' : '📧 Non verificata'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <button style={{ ...styles.actionBtn, borderColor: u.isActive ? colors.error : colors.success, color: u.isActive ? colors.error : colors.success }}
                  onClick={() => handleBan(u._id)}>{u.isActive ? '⛔ Sospendi' : '✅ Riattiva'}</button>
                <button style={styles.actionBtn} onClick={() => handleVerify(u._id, !u.isIDVerified)}>
                  {u.isIDVerified ? '🔄 Rimuovi verifica' : '🆔 Verifica ID'}
                </button>
                {u.role !== 'admin' && (
                  <button style={{ ...styles.actionBtn, borderColor: colors.warning, color: colors.warning }} onClick={() => handleMakeAdmin(u._id)}>
                    👑 Promuovi Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'rides' && (
        <div>
          {rides.map(ride => (
            <div key={ride._id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>🎵 {ride.destination?.name}</span>
                <span style={{ fontSize: 12, color: ride.status === 'attivo' ? colors.success : colors.textHint }}>
                  {ride.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>
                📍 {ride.departure?.address} → {ride.destination?.address}
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>
                🕐 {new Date(ride.departure?.dateTime).toLocaleString('it-IT')} • 👤 Driver: {ride.driver?.firstName} {ride.driver?.lastName} ({ride.driver?.email})
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>
                🚗 {ride.carBrand} {ride.carModel} • 💰 {ride.pricePerSeat}€ • 👥 {ride.bookedSeats}/{ride.availableSeats}
              </div>
              {ride.status === 'attivo' && (
                <button style={{ ...styles.actionBtn, borderColor: colors.error, color: colors.error, marginTop: 8 }}
                  onClick={() => handleCancelRide(ride._id)}>🗑️ Cancella passaggio</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'bookings' && (
        <div>
          {bookings.map(b => (
            <div key={b._id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>🎵 {b.ride?.destination?.name}</span>
                <span style={{
                  fontSize: 12, color: b.status === 'confermato' ? colors.success : b.status === 'pending' ? colors.warning : b.status === 'completato' ? colors.info : colors.error
                }}>{b.status}</span>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>
                👤 Passeggero: {b.passenger?.firstName} {b.passenger?.lastName}
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>
                👤 Driver: {b.driver?.firstName} {b.driver?.lastName}
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary }}>
                💰 {b.totalPrice}€ • 👥 {b.seatsBooked} posti • 🕐 {new Date(b.createdAt).toLocaleString('it-IT')}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'venues' && <VenuesManager />}

      {tab === 'reviews' && (
        <div>
          {reviews.length === 0 && <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>Nessuna recensione segnalata</p>}
          {reviews.map(review => (
            <div key={review._id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>Da: {review.reviewer?.firstName} {review.reviewer?.lastName}</span>
                <span style={{ fontSize: 12, color: colors.textHint }}>A: {review.reviewee?.firstName} {review.reviewee?.lastName}</span>
              </div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>★ {review.overallRating}/5</div>
              {review.comment && <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>"{review.comment}"</div>}
              <div style={{ fontSize: 12, color: colors.error, marginBottom: 8 }}>
                ⚠️ Segnalata: {review.reportReason || 'Motivo non specificato'}
              </div>
              <button style={{ ...styles.actionBtn, borderColor: colors.warning, color: colors.warning }}
                onClick={() => handleToggleReview(review._id)}>
                {review.isVisible ? '🙈 Nascondi' : '👁️ Mostra'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select style={styles.filterSelect} value={logFilter.category} onChange={e => setLogFilter({ ...logFilter, category: e.target.value })}>
              <option value="">Tutte le categorie</option>
              {logCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select style={styles.filterSelect} value={logFilter.action} onChange={e => setLogFilter({ ...logFilter, action: e.target.value })}>
              <option value="">Tutte le azioni</option>
              {logActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input style={styles.filterInput} placeholder="Cerca nei log..." value={logFilter.search}
              onChange={e => setLogFilter({ ...logFilter, search: e.target.value })} />
            <button style={styles.filterBtn} onClick={() => loadLogs(1)}>🔍 Cerca</button>
            <span style={{ fontSize: 12, color: colors.textHint }}>{logTotal} log totali</span>
          </div>

          {logs.map(log => (
            <div key={log._id} style={styles.logCard} onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    ...styles.logSeverity,
                    background: log.severity === 'error' ? `${colors.error}22` : log.severity === 'warning' ? `${colors.warning}22` : `${colors.info}22`,
                    color: log.severity === 'error' ? colors.error : log.severity === 'warning' ? colors.warning : colors.info,
                  }}>{log.severity}</span>
                  <span style={styles.logCategory}>{log.category}</span>
                  <span style={styles.logAction}>{log.action}</span>
                </div>
                <span style={{ fontSize: 11, color: colors.textHint }}>{new Date(log.createdAt).toLocaleString('it-IT')}</span>
              </div>
              <div style={{ fontSize: 13, color: colors.textPrimary }}>{log.description}</div>
              {log.user && <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>👤 {log.user.firstName} {log.user.lastName} ({log.user.email})</div>}
              {expandedLog === log._id && log.details && Object.keys(log.details).length > 0 && (
                <pre style={styles.logDetails}>{JSON.stringify(log.details, null, 2)}</pre>
              )}
            </div>
          ))}

          {logTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button style={styles.pageBtn} disabled={logPage <= 1} onClick={() => loadLogs(logPage - 1)}>←</button>
              <span style={{ fontSize: 13, color: colors.textSecondary, padding: '6px 0' }}>{logPage} / {logTotalPages}</span>
              <button style={styles.pageBtn} disabled={logPage >= logTotalPages} onClick={() => loadLogs(logPage + 1)}>→</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  searchInput: {
    width: '100%', padding: '10px 14px', marginBottom: 12, border: 'none', borderRadius: 10,
    background: colors.surface, color: colors.textPrimary, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  },
  card: {
    padding: 16, borderRadius: 12, background: colors.card, marginBottom: 12,
  },
  actionBtn: {
    padding: '5px 12px', borderRadius: 8, border: `1px solid ${colors.textHint}44`,
    background: 'transparent', color: colors.textPrimary, cursor: 'pointer', fontSize: 11,
  },
  adminBadge: {
    fontSize: 10, background: colors.warning, color: '#000', padding: '2px 6px', borderRadius: 8, marginLeft: 6,
  },
  filterSelect: {
    padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.glassBorder}`, background: colors.surface,
    color: colors.textPrimary, fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
  },
  filterInput: {
    flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.glassBorder}`,
    background: colors.surface, color: colors.textPrimary, fontSize: 12, outline: 'none', fontFamily: 'inherit',
  },
  filterBtn: {
    padding: '8px 16px', borderRadius: 8, border: 'none', background: colors.primary, color: '#fff', fontSize: 12,
    cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
  },
  logCard: {
    padding: '10px 14px', borderRadius: 10, background: colors.surface, marginBottom: 6, cursor: 'pointer',
    border: `1px solid ${colors.glassBorder}`, transition: 'all 0.2s',
  },
  logSeverity: {
    padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
  },
  logCategory: {
    fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase',
    background: `${colors.textHint}22`, padding: '2px 6px', borderRadius: 4,
  },
  logAction: {
    fontSize: 12, fontWeight: 600, color: colors.primary, fontFamily: 'monospace',
  },
  logDetails: {
    marginTop: 8, padding: 8, borderRadius: 6, background: colors.bg, color: colors.textSecondary,
    fontSize: 11, overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace',
  },
  pageBtn: {
    padding: '6px 14px', borderRadius: 6, border: `1px solid ${colors.glassBorder}`, background: colors.surface,
    color: colors.textPrimary, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
  },
};
