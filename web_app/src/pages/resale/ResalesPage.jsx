import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { resaleService } from '../../services/resaleService'
import { colors, radius, shadow } from '../../config/theme'
import LoadingSpinner from '../../components/LoadingSpinner'

const CATEGORY_COLORS = {
  salsa: '#E91E63',
  bachata: '#9C27B0',
  kizomba: '#673AB7',
  discoteca: '#00BCD4',
  concerto: '#4CAF50',
  festival: '#FF9800',
  altro: '#607D8B',
}

const CATEGORY_LABELS = {
  salsa: 'Salsa',
  bachata: 'Bachata',
  kizomba: 'Kizomba',
  discoteca: 'Discoteca',
  concerto: 'Concerto',
  festival: 'Festival',
  altro: 'Altro',
}

export default function ResalesPage() {
  const navigate = useNavigate()
  const [resales, setResales] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchResales = () => {
    setLoading(true)
    const params = {}
    if (search.trim()) params.search = search.trim()
    if (category) params.category = category
    if (city.trim()) params.city = city.trim()
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    params.page = page

    resaleService.getResales(params).then(r => {
      if (r.data.success) {
        setResales(r.data.data.resales)
        setTotalPages(r.data.data.totalPages)
        setTotal(r.data.data.total)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchResales() }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchResales()
  }

  const handleFilterChange = () => {
    setPage(1)
  }

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        if (search.trim() || category || city.trim() || minPrice || maxPrice) {
          setPage(1)
          setLoading(true)
          const params = {}
          if (search.trim()) params.search = search.trim()
          if (category) params.category = category
          if (city.trim()) params.city = city.trim()
          if (minPrice) params.minPrice = minPrice
          if (maxPrice) params.maxPrice = maxPrice
          params.page = 1
          resaleService.getResales(params).then(r => {
            if (r.data.success) {
              setResales(r.data.data.resales)
              setTotalPages(r.data.data.totalPages)
              setTotal(r.data.data.total)
            }
          }).catch(() => {}).finally(() => setLoading(false))
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [search, category, city, minPrice, maxPrice])

  const getDaysUntil = (dateStr) => {
    const now = new Date()
    const eventDate = new Date(dateStr)
    const diff = eventDate - now
    if (diff <= 0) return null
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'In 1 day'
    return `In ${days} days`
  }

  const getDiscountPercent = (original, asking) => {
    if (!original || !asking || original <= asking) return null
    return Math.round((1 - asking / original) * 100)
  }

  const isPastEvent = (dateStr) => {
    return new Date(dateStr) - new Date() <= 0
  }

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>Prevendite</h1>
        <p style={s.subtitle}>Compra e vendi biglietti per eventi</p>
      </div>

      <form onSubmit={handleSearch} style={s.searchForm}>
        <div style={s.searchBar}>
          <div style={s.searchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            style={s.searchInput}
            placeholder="Cerca evento..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" style={s.searchBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </form>

      <div style={s.filtersRow}>
        <div style={s.filterSelect}>
          <select
            style={s.selectInner}
            value={category}
            onChange={e => { setCategory(e.target.value); handleFilterChange() }}
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <div style={s.filterArrow}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div style={s.filterChip}>
          <input
            style={s.filterInput}
            placeholder="City"
            value={city}
            onChange={e => { setCity(e.target.value); handleFilterChange() }}
          />
        </div>

        <div style={s.filterChip}>
          <input
            style={{ ...s.filterInput, width: 70 }}
            placeholder="Min €"
            type="number"
            min="0"
            value={minPrice}
            onChange={e => { setMinPrice(e.target.value); handleFilterChange() }}
          />
        </div>

        <div style={s.filterDivider}>—</div>

        <div style={s.filterChip}>
          <input
            style={{ ...s.filterInput, width: 70 }}
            placeholder="Max €"
            type="number"
            min="0"
            value={maxPrice}
            onChange={e => { setMaxPrice(e.target.value); handleFilterChange() }}
          />
        </div>
      </div>

      {loading && (
        <div style={s.loadingWrap}>
          <LoadingSpinner />
        </div>
      )}

      {!loading && resales.length === 0 && (
        <div style={s.emptyState}>
          <div style={s.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p style={s.emptyText}>No tickets found</p>
          <p style={s.emptyHint}>Try adjusting your search or filters</p>
        </div>
      )}

      {!loading && resales.length > 0 && (
        <div style={s.resultInfo}>
          <span style={s.resultCount}>{total} ticket{total !== 1 ? 's' : ''} available</span>
        </div>
      )}

      <div style={s.cardGrid}>
        {resales.map(resale => {
          const discount = getDiscountPercent(resale.originalPrice, resale.price)
          const daysUntil = getDaysUntil(resale.eventDate)
          const past = isPastEvent(resale.eventDate)
          const sellerInitial = resale.seller?.firstName?.[0] || resale.seller?.username?.[0] || '?'

          return (
            <div
              key={resale._id}
              style={{
                ...s.card,
                borderLeft: resale.isFeatured ? `3px solid ${colors.gold}` : '3px solid transparent',
              }}
              onClick={() => navigate(`/resales/${resale._id}`)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = colors.glassBorderLight; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = resale.isFeatured ? colors.gold : 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {past && <div style={s.expiredOverlay}><span style={s.expiredText}>Event Passed</span></div>}

              <div style={s.cardTop}>
                {resale.category && (
                  <span style={{ ...s.categoryPill, background: CATEGORY_COLORS[resale.category] || CATEGORY_COLORS.altro }}>
                    {CATEGORY_LABELS[resale.category] || resale.category}
                  </span>
                )}
                <span style={s.cardDate}>
                  {new Date(resale.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {daysUntil && (
                <div style={s.daysBadge}>{daysUntil}</div>
              )}

              <h3 style={s.eventName}>{resale.eventName}</h3>

              <div style={s.venueRow}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={s.venueText}>{resale.city || resale.venue || 'Location TBA'}</span>
              </div>

              <div style={s.priceRow}>
                {resale.originalPrice && (
                  <span style={s.originalPrice}>€{resale.originalPrice}</span>
                )}
                <span style={s.askingPrice}>€{resale.price}</span>
                {discount && <span style={s.discountBadge}>-{discount}%</span>}
              </div>

              <div style={s.divider} />

              <div style={s.sellerRow}>
                <div style={s.sellerAvatar}>
                  <span style={s.sellerInitial}>{sellerInitial}</span>
                </div>
                <span style={s.sellerName}>
                  {resale.seller?.firstName ? `${resale.seller.firstName} ${resale.seller.lastName || ''}` : resale.seller?.username || 'Anonymous'}
                </span>
                {(resale.seller?.isPhoneVerified || resale.seller?.isVerified) && (
                  <div style={s.verifiedBadge} title="Venditore verificato">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button
            style={{ ...s.pageBtn, opacity: page <= 1 ? 0.3 : 1, pointerEvents: page <= 1 ? 'none' : 'auto' }}
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Previous
          </button>
          <div style={s.pageInfo}>
            <span style={s.pageCurrent}>{page}</span>
            <span style={s.pageDivider}>/</span>
            <span style={s.pageTotal}>{totalPages}</span>
          </div>
          <button
            style={{ ...s.pageBtn, opacity: page >= totalPages ? 0.3 : 1, pointerEvents: page >= totalPages ? 'none' : 'auto' }}
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  container: {
    padding: '24px 16px',
    maxWidth: 720,
    margin: '0 auto',
  },

  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textHint,
    margin: '4px 0 0',
    fontWeight: 400,
  },

  searchForm: {
    marginBottom: 20,
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.md,
    padding: '0 4px 0 14px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    transition: 'border-color 0.2s',
  },
  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: 400,
    padding: '12px 0',
    '::placeholder': { color: colors.textMuted },
  },
  searchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    border: 'none',
    borderRadius: radius.sm,
    background: colors.goldGradient,
    color: '#0F1115',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'opacity 0.2s',
    boxShadow: shadow.glow,
    margin: '3px 0',
  },

  filtersRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    overflowX: 'auto',
    paddingBottom: 4,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
  },
  filterSelect: {
    position: 'relative',
    background: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.md,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    minWidth: 140,
  },
  selectInner: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: 500,
    padding: '10px 32px 10px 14px',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    cursor: 'pointer',
  },
  filterArrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
  },
  filterChip: {
    background: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.md,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  filterInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: 400,
    padding: '10px 14px',
    width: 90,
    '::placeholder': { color: colors.textMuted },
  },
  filterDivider: {
    color: colors.textMuted,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    padding: '0 2px',
  },

  loadingWrap: {
    padding: '60px 0',
    display: 'flex',
    justifyContent: 'center',
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyText: {
    color: colors.textHint,
    fontSize: 15,
    fontWeight: 500,
    margin: '0 0 6px',
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    margin: 0,
  },

  resultInfo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
  },

  cardGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },

  card: {
    position: 'relative',
    background: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.lg,
    padding: '18px 18px 16px',
    cursor: 'pointer',
    overflow: 'hidden',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    borderLeft: '3px solid transparent',
  },

  expiredOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15,17,21,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderRadius: radius.lg,
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)',
  },
  expiredText: {
    color: colors.textHint,
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },

  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryPill: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardDate: {
    fontSize: 11,
    color: colors.textHint,
    fontWeight: 500,
  },

  daysBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    color: colors.gold,
    background: colors.goldGlow,
    padding: '3px 10px',
    borderRadius: 8,
    marginBottom: 10,
  },

  eventName: {
    fontSize: 17,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: '-0.2px',
  },

  venueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 14,
  },
  venueText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 400,
  },

  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  originalPrice: {
    fontSize: 13,
    color: colors.textMuted,
    textDecoration: 'line-through',
    fontWeight: 500,
  },
  askingPrice: {
    fontSize: 22,
    fontWeight: 700,
    background: colors.goldGradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
  },
  discountBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.success,
    background: colors.successBg,
    padding: '2px 8px',
    borderRadius: 6,
  },

  divider: {
    height: 1,
    background: colors.glassBorder,
    marginBottom: 12,
  },

  sellerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sellerAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: colors.goldGradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sellerInitial: {
    fontSize: 12,
    fontWeight: 700,
    color: '#0F1115',
  },
  sellerName: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: 500,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: colors.goldGlow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    marginBottom: 20,
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.sm,
    background: colors.glass,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'all 0.2s',
  },
  pageInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: colors.glass,
    border: `1px solid ${colors.glassBorder}`,
    borderRadius: radius.sm,
    padding: '8px 16px',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  pageCurrent: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: 700,
  },
  pageDivider: {
    color: colors.textMuted,
    fontSize: 13,
  },
  pageTotal: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
  },
}
