import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { colors } from '../config/theme';
import LoadingSpinner from '../components/LoadingSpinner';

const ICONS = {
  message: '💬',
  booking: '📋',
  review: '⭐',
  resale_sold: '🎟️',
  resale_contact: '📩',
  system: '🔔',
  new_message: '💬',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications();
      setNotifications(res.data.notifications || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleClick = (notif) => {
    if (!notif.read) handleMarkRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Notifiche</h2>
        {notifications.some(n => !n.read) && (
          <button style={styles.markAllBtn} onClick={handleMarkAllRead}>Segna tutte come lette</button>
        )}
      </div>

      {notifications.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: colors.textHint }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ fontSize: 15 }}>Nessuna notifica</p>
        </div>
      )}

      {notifications.map(notif => (
        <div
          key={notif._id}
          style={{ ...styles.card, borderLeft: notif.read ? 'none' : `3px solid ${colors.primary}`, opacity: notif.read ? 0.6 : 1 }}
          onClick={() => handleClick(notif)}
        >
          <div style={styles.row}>
            <span style={styles.icon}>{ICONS[notif.type] || '🔔'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.cardTitle, fontWeight: notif.read ? 400 : 700 }}>{notif.title}</div>
              <p style={styles.cardBody}>{notif.message}</p>
              <span style={styles.time}>{new Date(notif.createdAt).toLocaleString('it-IT')}</span>
            </div>
            {!notif.read && <div style={styles.dot} />}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700, margin: 0 },
  markAllBtn: { background: 'none', border: 'none', color: colors.primary, fontSize: 12, cursor: 'pointer' },
  card: { padding: 14, borderRadius: 12, background: colors.card, marginBottom: 8, cursor: 'pointer' },
  row: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  icon: { fontSize: 24, marginTop: 2 },
  cardTitle: { fontSize: 14, margin: '0 0 4px' },
  cardBody: { fontSize: 12, color: colors.textSecondary, margin: '0 0 4px', lineHeight: 1.4 },
  time: { fontSize: 11, color: colors.textHint },
  dot: { width: 10, height: 10, borderRadius: 5, background: colors.primary, flexShrink: 0, marginTop: 6 },
};
