import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChats } from '../contexts/ChatContext';
import { notificationService } from '../services/notificationService';
import { colors, radius, shadow } from '../config/theme';
import VerifiedBadge from './VerifiedBadge';
import CookieConsent from './CookieConsent';

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.bg} strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? colors.gold : colors.textHint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const SearchIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? colors.gold : colors.textHint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const ChatIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? colors.gold : colors.textHint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const ProfileIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? colors.gold : colors.textHint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalChatUnread } = useChats();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSections, setDrawerSections] = useState({ rides: false, resales: false });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try { const res = await notificationService.getUnreadCount(); setUnreadCount(res.data.count || 0); } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const tabs = [
    { path: '/home', label: 'Home', icon: HomeIcon },
    { path: '/search', label: 'Cerca', icon: SearchIcon },
    { path: '/chats', label: 'Chat', icon: ChatIcon },
    { path: '/profile', label: 'Profilo', icon: ProfileIcon },
  ];

  const handleFabClick = () => {
    const params = new URLSearchParams(location.search);
    const isResale = location.pathname.startsWith('/resales') || location.pathname.startsWith('/my-resales') || params.get('section') === 'resales';
    navigate(isResale ? '/resales/new' : '/create-ride');
  };

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div style={s.container}>
      <style>{`
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes fabPulse { 0% { box-shadow: 0 4px 24px rgba(212,175,55,0.25); } 50% { box-shadow: 0 4px 32px rgba(212,175,55,0.45); } 100% { box-shadow: 0 4px 24px rgba(212,175,55,0.25); } }
[data-drawer-item]:hover { color: ${colors.gold} !important; padding-left: 4px; }
[data-section-btn]:hover { color: ${colors.textSecondary} !important; }
[data-menu-btn]:hover { background: ${colors.cardHover}; border-color: ${colors.glassBorderLight}; }
[data-icon-btn]:hover { background: rgba(255,255,255,0.05); }
[data-fab]:hover { transform: scale(1.08); }
[data-logout-btn]:hover { opacity: 0.8; }
[data-drawer-close-btn]:hover { opacity: 0.7; }
      `}</style>

      <header style={s.header}>
        <button data-menu-btn="true" onClick={() => setDrawerOpen(true)} style={s.menuBtn}>
          <MenuIcon />
        </button>
        <div style={s.logo} onClick={() => navigate('/home')}>
          <img src="/Movo.png" alt="Movo" style={{ height: 128, width: 'auto' }} />
        </div>
        <button data-icon-btn="true" style={s.iconBtn} onClick={() => navigate('/notifications')}>
          <BellIcon />
          {unreadCount > 0 && <span style={s.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
      </header>

      {drawerOpen && (
        <div style={s.overlay} onClick={() => setDrawerOpen(false)}>
          <div style={s.drawer} onClick={e => e.stopPropagation()}>
            <button data-drawer-close-btn="true" style={s.drawerCloseBtn} onClick={() => setDrawerOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textHint} strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
            </button>
            <div style={s.drawerHeader}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="" style={s.drawerAvatarImg} />
              ) : (
                <div style={s.drawerAvatar}>
                  {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={s.drawerName}>{user?.firstName} {user?.lastName}{user?.isPhoneVerified && <VerifiedBadge size={14} />}</div>
                <div style={s.drawerEmail}>{user?.email}</div>
              </div>
            </div>

            <div style={s.drawerItems}>
              <button data-section-btn="true" style={s.sectionTitle} onClick={() => setDrawerSections(s => ({ ...s, rides: !s.rides }))}>
                <span>🚗 Passaggi</span>
                <span style={{ ...s.chevron, transform: drawerSections.rides ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              {drawerSections.rides && <>
                <Link to="/create-ride" data-drawer-item="true" style={{ ...s.drawerItem, color: colors.gold }} onClick={() => setDrawerOpen(false)}>⚡ Esco stasera</Link>
                <Link to="/my-rides" data-drawer-item="true" style={s.drawerItem} onClick={() => setDrawerOpen(false)}>🛣️ I miei passaggi</Link>
                <Link to="/bookings" data-drawer-item="true" style={s.drawerItem} onClick={() => setDrawerOpen(false)}>📋 Prenotazioni</Link>
              </>}

              <button data-section-btn="true" style={s.sectionTitle} onClick={() => setDrawerSections(s => ({ ...s, resales: !s.resales }))}>
                <span>🎟️ Prevendite</span>
                <span style={{ ...s.chevron, transform: drawerSections.resales ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              {drawerSections.resales && <>
                <Link to="/resales/new" data-drawer-item="true" style={s.drawerItem} onClick={() => setDrawerOpen(false)}>➕ Pubblica prevendita</Link>
                <Link to="/my-resales" data-drawer-item="true" style={s.drawerItem} onClick={() => setDrawerOpen(false)}>📦 Le mie prevendite</Link>
              </>}

              <div style={s.divider} />

              <Link to="/notifications" data-drawer-item="true" style={s.drawerItem} onClick={() => setDrawerOpen(false)}>
                🔔 Notifiche {unreadCount > 0 && <span style={{ color: colors.gold, marginLeft: 6 }}>({unreadCount})</span>}
              </Link>
              {!user?.isPhoneVerified && (
                <Link to="/verify-phone" data-drawer-item="true" style={{ ...s.drawerItem, color: colors.warning }} onClick={() => setDrawerOpen(false)}>
                  📧 Verifica account
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" data-drawer-item="true" style={{ ...s.drawerItem, color: colors.gold }} onClick={() => setDrawerOpen(false)}>
                  ⚡ Pannello Admin
                </Link>
              )}
              <Link to="/profile" data-drawer-item="true" style={s.drawerItem} onClick={() => setDrawerOpen(false)}>
                ⚙️ Impostazioni
              </Link>

              <button data-logout-btn="true" style={s.logoutBtn} onClick={async () => { await logout(); navigate('/login'); setDrawerOpen(false); }}>
                🚪 Esci
              </button>
            </div>
          </div>
        </div>
      )}

      <main style={s.main}>{children}</main>

      <CookieConsent />

      <button data-fab="true" style={s.fab} onClick={handleFabClick}>
        <PlusIcon />
        <span style={s.fabLabel}>
          {location.pathname.startsWith('/resales') || location.pathname.startsWith('/my-resales') ? 'VENDI' : 'OFFRI'}
        </span>
      </button>

      <nav style={s.bottomNav}>
        {tabs.map(tab => {
          const isActive = tab.path === '/home'
            ? (location.pathname === '/home' || location.pathname === '/')
            : location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              data-nav-item="true"
              style={{ ...s.navItem, color: isActive ? colors.gold : colors.textHint, position: 'relative' }}
              onClick={() => navigate(tab.path)}
            >
              <tab.icon active={isActive} />
              <span style={{ ...s.navLabel, color: isActive ? colors.gold : colors.textHint }}>
                {tab.label}
              </span>
              {tab.path === '/chats' && totalChatUnread > 0 && (
                <span style={s.chatBadge}>{totalChatUnread > 99 ? '99+' : totalChatUnread}</span>
              )}
              {isActive && <div style={s.navActiveIndicator} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    background: colors.bg,
    color: colors.textPrimary,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    paddingBottom: 80,
    position: 'relative',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    padding: '0 16px',
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid ' + colors.glassBorder,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },

  menuBtn: {
    background: 'none',
    border: '1px solid ' + colors.glassBorder,
    color: colors.textPrimary,
    cursor: 'pointer',
    padding: 0,
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    transition: 'all 0.25s ease',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    userSelect: 'none',
  },

  logoDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: colors.goldGradient,
    boxShadow: shadow.glow,
  },

  logoText: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: -0.5,
  },

  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    padding: 8,
    borderRadius: radius.sm,
    transition: 'background 0.25s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    background: colors.error,
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
    border: '2px solid ' + colors.glass,
  },
  chatBadge: {
    position: 'absolute',
    top: 2,
    right: '25%',
    background: colors.gold,
    color: '#0F1115',
    fontSize: 9,
    fontWeight: 800,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    boxShadow: shadow.glow,
    border: '1.5px solid ' + colors.bg,
  },

  main: {
    padding: 16,
    animation: 'fadeIn 0.4s ease',
    minHeight: 'calc(100vh - 120px)',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: colors.overlay,
    zIndex: 200,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    animation: 'fadeIn 0.2s ease',
  },

  drawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 290,
    background: colors.card,
    zIndex: 201,
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideIn 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    borderRight: '1px solid ' + colors.glassBorder,
    boxShadow: shadow.glass,
    overflow: 'hidden',
  },

  drawerCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: 'none',
    background: colors.surface,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  },

  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '28px 20px 20px',
    borderBottom: '1px solid ' + colors.glassBorder,
    background: colors.darkGradient,
  },

  drawerAvatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: colors.goldGradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: colors.bg,
    flexShrink: 0,
    boxShadow: shadow.glow,
  },

  drawerAvatarImg: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    border: '2px solid ' + colors.gold,
    boxShadow: shadow.glow,
  },

  drawerName: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.textPrimary,
  },

  drawerEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },

  drawerItems: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 20px 24px',
  },

  sectionTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '16px 0 8px',
    border: 'none',
    background: 'none',
    color: colors.textHint,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    cursor: 'pointer',
    transition: 'color 0.2s',
  },

  chevron: {
    fontSize: 10,
    transition: 'transform 0.3s ease',
    color: colors.textMuted,
  },

  drawerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    color: colors.textSecondary,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    borderBottom: '1px solid ' + colors.glassBorder,
    transition: 'color 0.2s, padding-left 0.2s',
    cursor: 'pointer',
  },

  divider: {
    height: 1,
    background: colors.glassBorder,
    margin: '12px 0',
  },

  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    color: colors.error,
    border: 'none',
    background: 'none',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'opacity 0.2s',
    marginTop: 4,
  },

  fab: {
    position: 'fixed',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: 'none',
    background: colors.goldGradient,
    color: colors.bg,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 99,
    boxShadow: shadow.glow,
    transition: 'transform 0.2s, box-shadow 0.2s',
    gap: 1,
  },

  fabLabel: {
    fontSize: 7,
    fontWeight: 800,
    letterSpacing: 1,
    color: colors.bg,
    marginTop: -1,
  },

  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid ' + colors.glassBorder,
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom, 0)',
  },

  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s',
    padding: 0,
    height: '100%',
  },

  navLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.8,
    transition: 'color 0.2s',
  },

  navActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: '0 0 3px 3px',
    background: colors.goldGradient,
    boxShadow: '0 0 8px ' + colors.goldGlow,
  },
};
