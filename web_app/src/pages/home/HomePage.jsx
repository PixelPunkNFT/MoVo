import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { venueService } from '../../services/venueService';
import { resaleService } from '../../services/resaleService';
import { colors, radius, shadow } from '../../config/theme';
import VerifiedBadge from '../../components/VerifiedBadge';

const CC = {
  salsa: '#E91E63', bachata: '#9C27B0', kizomba: '#673AB7',
  discoteca: '#00BCD4', concerto: '#4CAF50', festival: '#FF9800', altro: '#607D8B',
};
const CL = {
  salsa: 'Salsa', bachata: 'Bachata', kizomba: 'Kizomba',
  discoteca: 'Discoteca', concerto: 'Concerto', festival: 'Festival', altro: 'Altro',
};

export default function HomePage() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [section, setSection] = useState(sp.get('section') === 'resales' ? 'resales' : 'rides');
  const [venues, setVenues] = useState([]);
  const [resales, setResales] = useState([]);

  useEffect(() => {
    venueService.getAll().then(r => setVenues(r.data.venues)).catch(() => {});
    resaleService.getResales({ page: 1, limit: 3 }).then(r => setResales(r.data.resales || [])).catch(() => {});
  }, []);

  const fd = (d) => new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });

  const initials = ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() || 'U';

  return (
    <div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        .glass-hover { transition: border-color 0.3s ease; }
        .glass-hover:hover { border-color: ${colors.gold} !important; }
      `}</style>

      {/* Greeting */}
      <div style={s.greeting}>
        <div style={s.greetingLeft}>
          <div style={s.greetText}>
            Ciao, <span style={s.greetName}>{user?.firstName || 'Utente'}</span>{user?.isPhoneVerified && <VerifiedBadge size={16} />}
          </div>
          <div style={s.greetSub}>Pronto per uscire stasera?</div>
        </div>
        <div style={s.avatarCircle}>
          {user?.profilePhoto && !user.profilePhoto.includes('default-avatar')
            ? <img src={user.profilePhoto} alt="" style={s.avatarImg} />
            : <span style={s.avatarText}>{initials}</span>}
        </div>
      </div>

      {/* Section Switcher */}
      <div style={s.switcher}>
        <button
          style={{ ...s.swBtn, ...(section === 'rides' ? s.swActive : s.swInactive) }}
          onClick={() => { setSection('rides'); setSp({}); }}
        >🚗 Passaggi</button>
        <button
          style={{ ...s.swBtn, ...(section === 'resales' ? s.swActive : s.swInactive) }}
          onClick={() => { setSection('resales'); setSp({ section: 'resales' }); }}
        >🎟️ Prevendite</button>
      </div>

      {section === 'rides' ? (
        <>
          {/* Quick Actions */}
          <div style={s.quickActions}>
            <div className="glass-hover" style={s.qAction} onClick={() => navigate('/search')}>
              <span style={s.qIcon}>🔍</span>
              <span style={s.qLabel}>Cerca passaggio</span>
              <span style={s.qSub}>Trova un passaggio per uscire</span>
              <span style={s.qArrow}>→</span>
            </div>
            <div className="glass-hover" style={s.qAction} onClick={() => navigate('/create-ride')}>
              <span style={s.qIcon}>⚡</span>
              <span style={s.qLabel}>Esco stasera!</span>
              <span style={s.qSub}>Passaggio di gruppo in 10 secondi</span>
              <span style={s.qArrow}>→</span>
            </div>
          </div>

          {/* Venues */}
          <div style={s.sectionHeader}>
            <h3 style={s.sectionTitle}>Locali Popolari</h3>
            <button style={s.viewAll} onClick={() => navigate('/search')}>Vedi tutti</button>
          </div>
          {venues.length === 0 ? (
            <div style={s.emptyState}>Nessun locale disponibile</div>
          ) : venues.map((club, i) => (
            <div
              key={club._id}
              className="glass-hover fade-in"
              style={{ ...s.venueCard, animationDelay: `${i * 0.08}s` }}
              onClick={() => navigate(`/search?destination=${encodeURIComponent(club.name)}`)}
            >
              <div style={s.venueIcon}>🎵</div>
              <div style={s.venueInfo}>
                <div style={s.venueName}>{club.name}</div>
                <div style={s.venueMeta}>{club.type}{club.music?.length ? ` • ${club.music.join(', ')}` : ''}</div>
              </div>
              <span style={s.chevron}>›</span>
            </div>
          ))}
        </>
      ) : (
        <>
          {/* Quick Actions */}
          <div style={s.quickActions}>
            <div className="glass-hover" style={s.qAction} onClick={() => navigate('/resales')}>
              <span style={s.qIcon}>🔍</span>
              <span style={s.qLabel}>Cerca prevendite</span>
              <span style={s.qSub}>Trova biglietti in vendita</span>
              <span style={s.qArrow}>→</span>
            </div>
            <div className="glass-hover" style={s.qAction} onClick={() => navigate('/resales/new')}>
              <span style={s.qIcon}>🎟️</span>
              <span style={s.qLabel}>Vendi biglietti</span>
              <span style={s.qSub}>Pubblica la tua prevendita</span>
              <span style={s.qArrow}>→</span>
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsRow}>
            <div className="glass-hover" style={s.statCard} onClick={() => navigate('/my-resales')}>
              <span style={s.statNum}>{user?.resalesActive || 0}</span>
              <span style={s.statLabel}>Attive</span>
            </div>
            <div className="glass-hover" style={s.statCard} onClick={() => navigate('/my-resales')}>
              <span style={s.statNum}>{user?.resalesSold || 0}</span>
              <span style={s.statLabel}>Vendute</span>
            </div>
            <div className="glass-hover" style={s.statCard} onClick={() => navigate('/resales')}>
              <span style={s.statNum}>{resales.length}+</span>
              <span style={s.statLabel}>Disponibili</span>
            </div>
          </div>

          {/* Resale Listings */}
          {resales.length > 0 && (
            <>
              <div style={s.sectionHeader}>
                <h3 style={s.sectionTitle}>Ultime Prevendite</h3>
                <button style={s.viewAll} onClick={() => navigate('/resales')}>Vedi tutte</button>
              </div>
              {resales.map((r, i) => (
                <div
                  key={r._id}
                  className="glass-hover fade-in"
                  style={{ ...s.resaleCard, animationDelay: `${i * 0.08}s` }}
                  onClick={() => navigate(`/resales/${r._id}`)}
                >
                  <div style={s.resaleTop}>
                    <span style={{ ...s.catBadge, background: `${CC[r.category] || '#607D8B'}22`, color: CC[r.category] || '#607D8B' }}>{CL[r.category] || r.category}</span>
                    <span style={s.resaleDate}>{r.eventDate ? fd(r.eventDate) : ''}</span>
                  </div>
                  <div style={s.resaleName}>{r.eventName}</div>
                  <div style={s.resaleLocation}>{r.city}{r.venue ? ` • ${r.venue}` : ''}</div>
                  <div style={s.resaleBottom}>
                    <div>
                      <span style={s.origPrice}>€{r.originalPrice}</span>
                      <span style={s.askPrice}>€{r.askingPrice}</span>
                    </div>
                    <span style={s.qtyBadge}>{r.quantity} pz</span>
                  </div>
                </div>
              ))}
            </>
          )}
          {resales.length === 0 && (
            <div style={s.emptyState}>Nessuna prevendita disponibile</div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  greeting: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  greetingLeft: {
    flex: 1,
  },
  greetText: {
    fontSize: 26,
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  greetName: {
    color: colors.textPrimary,
  },
  greetSub: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: 500,
    marginTop: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: colors.goldGradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: shadow.glow,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1,
  },
  avatarImg: {
    width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', display: 'block',
  },

  switcher: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    padding: 10,
    borderRadius: 14,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
  },
  swBtn: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  swActive: {
    background: colors.goldGradient,
    color: '#fff',
    boxShadow: shadow.glow,
  },
  swInactive: {
    background: 'transparent',
    color: colors.textSecondary,
  },

  quickActions: {
    display: 'flex',
    gap: 12,
    marginBottom: 28,
    marginTop: 4,
  },
  qAction: {
    flex: 1,
    padding: 24,
    borderRadius: 18,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  qIcon: {
    display: 'block',
    fontSize: 36,
    marginBottom: 12,
    lineHeight: 1,
  },
  qLabel: {
    display: 'block',
    fontSize: 15,
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  qSub: {
    display: 'block',
    fontSize: 12,
    color: colors.textHint,
  },
  qArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 18,
    color: colors.gold,
    fontWeight: 700,
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
  },
  viewAll: {
    background: 'none',
    border: 'none',
    color: colors.gold,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '4px 0',
  },

  statsRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    padding: '20px 12px',
    borderRadius: 14,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  statNum: {
    display: 'block',
    fontSize: 24,
    fontWeight: 700,
    color: colors.gold,
    marginBottom: 4,
    lineHeight: 1.2,
  },
  statLabel: {
    display: 'block',
    fontSize: 10,
    color: colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  emptyState: {
    padding: '40px 0',
    textAlign: 'center',
    color: colors.textHint,
    fontSize: 14,
  },

  venueCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    marginBottom: 8,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  venueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    background: colors.darkGradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
    border: `1px solid ${colors.glassBorderLight}`,
  },
  venueInfo: {
    flex: 1,
    minWidth: 0,
  },
  venueName: {
    fontSize: 15,
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  venueMeta: {
    fontSize: 12,
    color: colors.textHint,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chevron: {
    fontSize: 24,
    color: colors.gold,
    fontWeight: 300,
    flexShrink: 0,
    lineHeight: 1,
  },

  catBadge: {
    padding: '4px 12px',
    borderRadius: 8,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resaleCard: {
    padding: 16,
    borderRadius: 14,
    background: colors.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.glassBorder}`,
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  resaleTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resaleDate: {
    fontSize: 11,
    color: colors.textHint,
    marginLeft: 'auto',
  },
  resaleName: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resaleLocation: {
    fontSize: 12,
    color: colors.textHint,
    marginBottom: 12,
  },
  resaleBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  origPrice: {
    fontSize: 12,
    color: colors.textMuted,
    textDecoration: 'line-through',
    marginRight: 8,
  },
  askPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.gold,
  },
  qtyBadge: {
    fontSize: 11,
    color: colors.textSecondary,
    background: 'rgba(255,255,255,0.06)',
    padding: '4px 10px',
    borderRadius: 8,
    fontWeight: 600,
  },
};
