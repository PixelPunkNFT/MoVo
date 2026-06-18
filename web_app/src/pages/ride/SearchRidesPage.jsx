import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRides } from '../../contexts/RideContext';
import { resaleService } from '../../services/resaleService';
import { colors, radius, shadow } from '../../config/theme';
import VerifiedBadge from '../../components/VerifiedBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { shareWhatsApp } from '../../utils/share';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import BadgeRow from '../../components/BadgeRow';
import VenuePicker from '../../components/VenuePicker';
 
const CATEGORY_COLORS = {
  salsa: '#E91E63', bachata: '#9C27B0', kizomba: '#673AB7',
  discoteca: '#00BCD4', concerto: '#4CAF50', festival: '#FF9800', altro: '#607D8B',
};
const CATEGORY_LABELS = {
  salsa: 'Salsa', bachata: 'Bachata', kizomba: 'Kizomba',
  discoteca: 'Discoteca', concerto: 'Concerto', festival: 'Festival', altro: 'Altro',
};

export default function SearchRidesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState(searchParams.get('section') === 'resales' ? 'resales' : 'rides');
  const navigate = useNavigate();

  const { rides, loading, searchRides } = useRides();
  const [rideFilters, setRideFilters] = useState({ destinationName: searchParams.get('destination') || '', date: '' });
  const [spontaneousFilter, setSpontaneousFilter] = useState('');

  const [resales, setResales] = useState([]);
  const [resaleLoading, setResaleLoading] = useState(false);
  const [resaleFilters, setResaleFilters] = useState({ category: '', city: '', minPrice: '', maxPrice: '', search: '' });

  useEffect(() => {
    const dest = searchParams.get('destination') || '';
    const sec = searchParams.get('section') === 'resales' ? 'resales' : 'rides';
    setRideFilters({ destinationName: dest, date: '' });
    setSpontaneousFilter('');
    setSection(sec);
    if (sec === 'rides') {
      searchRides({ destinationName: dest, date: '' });
    } else {
      handleResaleSearch();
    }
  }, [searchParams]);

  const handleRideSearch = (e, spontOverride) => {
    if (e?.preventDefault) e.preventDefault();
    const params = { ...rideFilters };
    const spontValue = spontOverride !== undefined ? spontOverride : spontaneousFilter;
    if (spontValue) params.spontaneous = spontValue;
    if (spontOverride !== undefined) setSpontaneousFilter(spontOverride);
    searchRides(params);
  };
  const handleResaleSearch = async (e) => {
    if (e) e.preventDefault();
    setResaleLoading(true);
    try {
      const params = {};
      if (resaleFilters.category) params.category = resaleFilters.category;
      if (resaleFilters.city) params.city = resaleFilters.city;
      if (resaleFilters.minPrice) params.minPrice = resaleFilters.minPrice;
      if (resaleFilters.maxPrice) params.maxPrice = resaleFilters.maxPrice;
      if (resaleFilters.search) params.eventName = resaleFilters.search;
      const res = await resaleService.getResales({ ...params, page: 1, limit: 50 });
      setResales(res.data.resales || []);
    } catch {} finally { setResaleLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });

  const isRides = section === 'rides';

  return (
    <div>
      <div style={s.switcher}>
        <button
          style={{ ...s.switchBtn, ...(isRides ? s.switchActive : s.switchInactive) }}
          onClick={() => { setSection('rides'); setSearchParams({}); }}
        >Passaggi</button>
        <button
          style={{ ...s.switchBtn, ...(!isRides ? s.switchActive : s.switchInactive) }}
          onClick={() => { setSection('resales'); setSearchParams({ section: 'resales' }); }}
        >Prevendite</button>
      </div>

      {isRides ? (
        <>
          <form onSubmit={handleRideSearch} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Destinazione</label>
              <div style={s.fieldCard}>
                <VenuePicker
                  value={rideFilters.destinationName}
                  placeholder="Tutti i locali"
                  onChange={(dest) => setRideFilters({ ...rideFilters, destinationName: dest.name })}
                />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Data</label>
                <div style={s.fieldCard}>
                  <input style={s.input} type="date" value={rideFilters.date} onChange={e => setRideFilters({ ...rideFilters, date: e.target.value })} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Posti</label>
                <div style={s.fieldCard}>
                  <input style={s.input} placeholder="Posti" type="number" min="1" onChange={e => setRideFilters({ ...rideFilters, seats: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Prezzo max</label>
                <div style={s.fieldCard}>
                  <input style={s.input} placeholder="€" type="number" min="0" onChange={e => setRideFilters({ ...rideFilters, maxPrice: e.target.value })} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Genere</label>
                <div style={s.fieldCard}>
                  <select style={s.select} onChange={e => setRideFilters({ ...rideFilters, musicType: e.target.value })}>
                    <option value="">Tutti</option>
                    <option value="salsa">Salsa</option>
                    <option value="bachata">Bachata</option>
                    <option value="reggaeton">Reggaeton</option>
                    <option value="merengue">Merengue</option>
                    <option value="kizomba">Kizomba</option>
                  </select>
                </div>
              </div>
            </div>
            <button style={s.btn} type="submit">Cerca Passaggio</button>
          </form>

          {/* Spontaneous filter toggle */}
          <div style={s.spontaneousFilter}>
            <button style={{ ...s.spontBtn, ...(!spontaneousFilter ? s.spontActive : {}) }} onClick={() => handleRideSearch(null, '')}>
              Tutti
            </button>
            <button style={{ ...s.spontBtn, ...(spontaneousFilter === 'false' ? s.spontActive : {}) }} onClick={() => handleRideSearch(null, 'false')}>
              Organizzati
            </button>
            <button style={{ ...s.spontBtn, ...(spontaneousFilter === 'true' ? s.spontActive : {}) }} onClick={() => handleRideSearch(null, 'true')}>
              ⚡ Spontanei
            </button>
          </div>

          {loading && <LoadingSpinner />}
          <div style={s.results}>
            {!loading && rides.length === 0 && <p style={s.empty}>Nessun passaggio trovato</p>}
            {rides.map(ride => (
              <div key={ride._id} style={s.rideCard} onClick={() => navigate(`/rides/${ride._id}`)}>
                <div style={s.rideHeader}>
                  <div style={s.rideDriver}>
                    {ride.driver?.profilePhoto && !ride.driver.profilePhoto.includes('default-avatar')
                      ? <img src={ride.driver.profilePhoto} alt="" style={s.avatarImg} />
                      : <div style={s.avatar}>{ride.driver?.firstName?.[0] || 'D'}</div>}
                    <div>
                      <div style={s.driverName}>{ride.driver?.firstName} {ride.driver?.lastName}{ride.driver?.isPhoneVerified && <VerifiedBadge size={12} />}</div>
                      <div style={s.rating}>★ {ride.driver?.rating?.toFixed(1) || 'N/A'}</div>
                      <BadgeRow badges={ride.driver?.badges} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {ride.spontaneous ? (
                      <div style={s.spontBadge}>⚡</div>
                    ) : (
                      <div style={s.price}>{ride.pricePerSeat}€</div>
                    )}
                    <button style={s.shareBtn} onClick={e => { e.stopPropagation(); shareWhatsApp(ride); }}><WhatsAppIcon size={14} /></button>
                  </div>
                </div>
                <div style={s.routeInfo}>
                  {ride.spontaneous ? (
                    <span style={{ color: colors.textHint }}>Da concordare</span>
                  ) : (
                    <span>{ride.departure?.address}</span>
                  )}
                  <span style={s.arrow}>→</span>
                  <span style={s.destName}>{ride.destination?.name}</span>
                </div>
                <div style={s.rideMeta}>
                  <span>{new Date(ride.departure?.dateTime).toLocaleString('it-IT')}</span>
                  {ride.spontaneous ? (
                    <span style={{ color: colors.gold }}>⚡ Spontaneo</span>
                  ) : (
                    <span>{ride.carBrand} {ride.carModel}</span>
                  )}
                  <span>{ride.remainingSeats}/{ride.availableSeats} posti</span>
                </div>
                {ride.notes && <div style={s.rideNote}>{ride.notes}</div>}
                {ride.preferences?.musicType && ride.preferences.musicType !== 'nessuna' && !ride.spontaneous && (
                  <div style={s.musicTag}>{ride.preferences.musicType}</div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <form onSubmit={handleResaleSearch} style={s.form}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Cerca evento</label>
              <div style={s.fieldCard}>
                <input style={s.input} placeholder="Nome evento..." value={resaleFilters.search} onChange={e => setResaleFilters({ ...resaleFilters, search: e.target.value })} />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Categoria</label>
                <div style={s.fieldCard}>
                  <select style={s.select} value={resaleFilters.category} onChange={e => setResaleFilters({ ...resaleFilters, category: e.target.value })}>
                    <option value="">Tutte</option>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Città</label>
                <div style={s.fieldCard}>
                  <input style={s.input} placeholder="Città" value={resaleFilters.city} onChange={e => setResaleFilters({ ...resaleFilters, city: e.target.value })} />
                </div>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Prezzo min</label>
                <div style={s.fieldCard}>
                  <input style={s.input} placeholder="€" type="number" min="0" value={resaleFilters.minPrice} onChange={e => setResaleFilters({ ...resaleFilters, minPrice: e.target.value })} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Prezzo max</label>
                <div style={s.fieldCard}>
                  <input style={s.input} placeholder="€" type="number" min="0" value={resaleFilters.maxPrice} onChange={e => setResaleFilters({ ...resaleFilters, maxPrice: e.target.value })} />
                </div>
              </div>
            </div>
            <button style={s.btn} type="submit">Cerca Prevendite</button>
          </form>

          {resaleLoading && <LoadingSpinner />}
          <div style={s.results}>
            {!resaleLoading && resales.length === 0 && <p style={s.empty}>Nessuna prevendita trovata</p>}
            {resales.map(r => (
              <div key={r._id} style={s.resaleCard} onClick={() => navigate(`/resales/${r._id}`)}>
                <div style={s.resaleTop}>
                  <span style={{ ...s.catBadge, background: `${CATEGORY_COLORS[r.category] || '#607D8B'}22`, color: CATEGORY_COLORS[r.category] || '#607D8B' }}>
                    {CATEGORY_LABELS[r.category] || r.category}
                  </span>
                  <span style={s.resaleDate}>{r.eventDate ? formatDate(r.eventDate) : ''}</span>
                  {r.isExpired && <span style={s.expired}>Passato</span>}
                </div>
                <div style={s.resaleTitle}>{r.eventName}</div>
                <div style={s.resaleLocation}>{r.city}{r.venue ? ` • ${r.venue}` : ''}</div>
                <div style={s.resalePriceRow}>
                  <span style={s.originalPrice}>€{r.originalPrice}</span>
                  <span style={s.askingPrice}>€{r.askingPrice}</span>
                  {r.discount > 0 && <span style={s.discountBadge}>-{r.discount}%</span>}
                </div>
                <div style={s.sellerRow}>
                  {r.seller?.profilePhoto && !r.seller.profilePhoto.includes('default-avatar')
                    ? <img src={r.seller.profilePhoto} alt="" style={s.smallAvatarImg} />
                    : <div style={s.smallAvatar}>{r.seller?.firstName?.[0] || '?'}</div>}
                  <span style={s.sellerName}>{r.seller?.firstName} {r.seller?.lastName}{r.seller?.isPhoneVerified && <VerifiedBadge size={12} />}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  switcher: {
    display: 'flex', gap: 4, marginBottom: 24, borderRadius: radius.md, padding: 4,
    background: colors.glass, border: `1px solid ${colors.glassBorder}`, backdropFilter: 'blur(12px)',
    boxShadow: shadow.glass,
  },
  switchBtn: {
    flex: 1, padding: '12px 16px', border: 'none', borderRadius: radius.sm, fontSize: 14,
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease', fontFamily: 'inherit',
  },
  switchActive: {
    background: colors.goldGradient, color: '#0F1115', boxShadow: shadow.glow,
  },
  switchInactive: {
    background: 'transparent', color: colors.textHint, backdropFilter: 'blur(4px)',
  },
  form: {
    marginBottom: 20,
  },
  fieldGroup: {
    flex: 1, marginBottom: 12,
  },
  label: {
    display: 'block', fontSize: 11, fontWeight: 600, color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6,
  },
  fieldCard: {
    background: colors.surface, border: `1px solid ${colors.glassBorder}`, borderRadius: radius.md,
    padding: '14px 16px', transition: 'all 0.3s ease',
  },
  input: {
    width: '100%', border: 'none', background: 'transparent', color: colors.textPrimary,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    '::placeholder': { color: colors.textMuted },
  },
  select: {
    width: '100%', border: 'none', background: 'transparent', color: colors.textPrimary,
    fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
  },
  row: {
    display: 'flex', gap: 12, marginBottom: 0,
  },
  btn: {
    width: '100%', padding: '14px', border: 'none', borderRadius: radius.md,
    background: colors.goldGradient, color: '#0F1115', fontSize: 15, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', boxShadow: shadow.glow, transition: 'all 0.3s ease',
    marginTop: 8,
  },
  spontaneousFilter: {
    display: 'flex', gap: 6, marginTop: 16, marginBottom: 8,
  },
  spontBtn: {
    flex: 1, padding: '8px 10px', border: 'none', borderRadius: 10,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    background: colors.surface, color: colors.textSecondary, transition: 'all 0.2s',
  },
  spontActive: {
    background: colors.goldGradient, color: '#0F1115',
  },
  results: {
    marginTop: 24,
  },
  empty: {
    color: colors.textSecondary, textAlign: 'center', padding: '40px 0', fontSize: 14,
  },
  rideCard: {
    padding: 18, borderRadius: radius.lg, marginBottom: 12, cursor: 'pointer',
    background: colors.glass, border: `1px solid ${colors.glassBorder}`, backdropFilter: 'blur(12px)',
    boxShadow: shadow.glass, transition: 'all 0.3s ease',
  },
  rideHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  rideDriver: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatarImg: { width: 40, height: 40, borderRadius: 20, objectFit: 'cover', boxShadow: shadow.glow },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    background: colors.goldGradient, color: '#0F1115',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, boxShadow: shadow.glow,
  },
  driverName: {
    fontSize: 15, fontWeight: 600, color: colors.textPrimary,
  },
  rating: {
    fontSize: 12, color: colors.gold,
  },
  price: {
    fontSize: 20, fontWeight: 700, color: colors.gold,
  },
  shareBtn: {
    background: colors.whatsapp, border: 'none', cursor: 'pointer', fontSize: 13, padding: '4px 8px', lineHeight: 1, color: '#fff', borderRadius: 8,
  },
  routeInfo: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textSecondary,
    marginBottom: 10, flexWrap: 'wrap',
  },
  arrow: {
    color: colors.gold, fontWeight: 700,
  },
  destName: {
    color: colors.textPrimary, fontWeight: 500,
  },
  rideMeta: {
    display: 'flex', gap: 12, fontSize: 12, color: colors.textHint, flexWrap: 'wrap', marginBottom: 8,
  },
  musicTag: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500,
    background: 'rgba(212,175,55,0.15)', color: colors.goldLight, border: '1px solid rgba(212,175,55,0.25)',
  },
  spontBadge: {
    fontSize: 28, lineHeight: 1, color: colors.gold,
  },
  rideNote: {
    fontSize: 12, color: colors.textHint, fontStyle: 'italic', marginTop: 8,
    paddingTop: 8, borderTop: `1px solid ${colors.glassBorder}`,
  },
  catBadge: {
    padding: '2px 10px', borderRadius: 8, fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
  },
  resaleCard: {
    padding: 16, borderRadius: radius.lg, marginBottom: 12, cursor: 'pointer',
    background: colors.glass, border: `1px solid ${colors.glassBorder}`, backdropFilter: 'blur(12px)',
    boxShadow: shadow.glass, transition: 'all 0.3s ease',
  },
  resaleTop: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
  },
  resaleDate: {
    fontSize: 11, color: colors.textHint,
  },
  expired: {
    fontSize: 11, color: colors.error,
  },
  resaleTitle: {
    fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 4,
  },
  resaleLocation: {
    color: colors.textSecondary, fontSize: 12, marginBottom: 10,
  },
  resalePriceRow: {
    display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 10,
  },
  originalPrice: {
    fontSize: 12, color: colors.textMuted, textDecoration: 'line-through',
  },
  askingPrice: {
    fontSize: 18, fontWeight: 700, color: colors.gold,
  },
  discountBadge: {
    fontSize: 12, color: colors.success, fontWeight: 600,
  },
  sellerRow: {
    display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8,
    borderTop: `1px solid ${colors.glassBorder}`,
  },
  smallAvatarImg: { width: 24, height: 24, borderRadius: 12, objectFit: 'cover' },
  smallAvatar: {
    width: 24, height: 24, borderRadius: 12,
    background: colors.goldGradient, color: '#0F1115',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700,
  },
  sellerName: {
    fontSize: 12, color: colors.textSecondary,
  },
};
