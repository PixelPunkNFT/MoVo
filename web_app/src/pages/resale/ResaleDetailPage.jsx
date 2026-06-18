import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { colors, radius, shadow } from '../../config/theme'
import { resaleService } from '../../services/resaleService'
import { favoriteService } from '../../services/favoriteService'
import { reportService } from '../../services/reportService'
import StarRating from '../../components/StarRating'
import LoadingSpinner from '../../components/LoadingSpinner'

const s = {
  page: { padding: '20px 16px 32px', background: colors.bg, minHeight: '100vh' },

  heroWrap: { position: 'relative', borderRadius: radius.lg, overflow: 'hidden', marginBottom: 0 },
  heroImg: { width: '100%', height: 240, objectFit: 'cover', display: 'block' },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(0deg, rgba(15,17,21,0.92) 0%, rgba(15,17,21,0.15) 50%, rgba(15,17,21,0.4) 100%)',
  },
  heroFav: {
    position: 'absolute', top: 12, right: 12, zIndex: 2,
    width: 40, height: 40, borderRadius: radius.full,
    background: 'rgba(15,17,21,0.7)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.10)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1, transition: 'all 0.2s',
  },

  contentCard: {
    position: 'relative', zIndex: 2,
    marginTop: -40, marginBottom: 14,
    padding: 20, borderRadius: radius.lg,
    background: colors.glass, backdropFilter: 'blur(16px)',
    border: `1px solid ${colors.glassBorder}`,
    boxShadow: shadow.glass,
  },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  eventName: { fontSize: 24, fontWeight: 700, color: colors.textPrimary, margin: 0, lineHeight: 1.25 },
  catBadge: {
    display: 'inline-block', padding: '4px 14px', borderRadius: radius.full,
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: 10, marginTop: 8,
  },
  locationLine: { fontSize: 14, color: colors.textSecondary, margin: '4px 0', display: 'flex', alignItems: 'center', gap: 6 },
  dateLine: { fontSize: 14, color: colors.textSecondary, margin: '4px 0', display: 'flex', alignItems: 'center', gap: 6 },

  countdownCard: {
    padding: '14px 20px', borderRadius: radius.lg, marginBottom: 14, textAlign: 'center',
    background: colors.glass, backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.goldGlow}`,
    boxShadow: `0 0 24px ${colors.goldGlow}`,
  },
  countdownText: (expired) => ({
    fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '0.3px',
    color: expired ? colors.error : colors.gold,
  }),

  pricingCard: {
    padding: 20, borderRadius: radius.lg, marginBottom: 14,
    background: colors.glass, backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.glassBorder}`,
  },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceLeft: { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  origPrice: { fontSize: 15, color: colors.textMuted, textDecoration: 'line-through' },
  askPrice: { fontSize: 28, fontWeight: 800, color: colors.gold, lineHeight: 1 },
  discBadge: {
    display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
    borderRadius: radius.full, background: colors.successBg,
    color: colors.success, fontSize: 12, fontWeight: 700,
  },
  qtyBadge: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px',
    borderRadius: radius.full, background: colors.surface, color: colors.textHint,
    fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
  },

  descCard: {
    padding: 20, borderRadius: radius.lg, marginBottom: 14,
    background: colors.glass, backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.glassBorder}`,
  },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: colors.gold, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' },
  descText: { fontSize: 14, color: colors.textSecondary, lineHeight: 1.7, margin: 0 },

  galleryCard: {
    padding: 20, borderRadius: radius.lg, marginBottom: 14,
    background: colors.glass, backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.glassBorder}`,
  },
  gallery: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 },
  galleryImg: { width: 100, height: 100, borderRadius: radius.sm, objectFit: 'cover', flexShrink: 0 },

  claimBtn: {
    width: '100%', padding: 16, border: 'none', borderRadius: radius.lg, cursor: 'pointer',
    background: colors.goldGradient, color: colors.bg, fontSize: 17, fontWeight: 700,
    boxShadow: shadow.glow, marginBottom: 14, transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  claimedCard: {
    padding: 20, borderRadius: radius.lg, marginBottom: 14, textAlign: 'center',
    background: colors.successBg, border: `1px solid ${colors.success}44`,
  },
  claimedTitle: { fontSize: 15, fontWeight: 700, color: colors.success, margin: '0 0 4px' },
  claimedSub: { fontSize: 13, color: colors.textSecondary, margin: 0, lineHeight: 1.5 },
  whatsappBtn: {
    width: '100%', padding: 15, border: 'none', borderRadius: radius.md, cursor: 'pointer',
    background: colors.whatsapp, color: '#fff', fontSize: 16, fontWeight: 700,
    boxShadow: '0 4px 20px rgba(37,211,102,0.35)', marginBottom: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
  },
  claimedOtherCard: {
    padding: 20, borderRadius: radius.lg, marginBottom: 14, textAlign: 'center',
    background: colors.warningBg, border: `1px solid ${colors.warning}44`,
  },
  claimedOtherText: { fontSize: 14, fontWeight: 600, color: colors.warning, margin: 0, lineHeight: 1.5 },

  sellerCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: 20, borderRadius: radius.lg, marginBottom: 14,
    background: colors.glass, backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.glassBorder}`,
  },
  avatarRingImg: { width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarRing: {
    width: 48, height: 48, borderRadius: radius.full, flexShrink: 0,
    background: colors.goldGradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 700, color: colors.bg,
  },
  sellerInfo: { flex: 1, minWidth: 0 },
  sellerNameRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sellerName: { fontSize: 16, fontWeight: 700, color: colors.textPrimary },
  verifiedBadge: { fontSize: 11, fontWeight: 600, color: colors.gold, display: 'flex', alignItems: 'center', gap: 3 },
  contactBtn: {
    padding: '8px 18px', borderRadius: radius.md, cursor: 'pointer',
    background: 'transparent', border: `1.5px solid ${colors.gold}`,
    color: colors.gold, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
    transition: 'all 0.2s', flexShrink: 0,
  },

  ownerActions: { display: 'flex', gap: 10, marginBottom: 14 },
  actionBtn: (bg) => ({
    flex: 1, padding: '12px 8px', border: 'none', borderRadius: radius.md,
    background: bg, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s',
  }),

  reportBtn: {
    width: '100%', padding: 14, cursor: 'pointer', marginBottom: 24,
    border: `1px solid ${colors.glassBorder}`, borderRadius: radius.md,
    background: 'transparent', color: colors.textMuted, fontSize: 13, fontWeight: 500,
    transition: 'all 0.2s',
  },
}

const CAT_COLORS = {
  salsa: '#FF6B35', bachata: '#E91E63', kizomba: '#9C27B0',
  discoteca: '#00BCD4', concerto: '#4CAF50', festival: '#FF9800', altro: '#607D8B',
}

export default function ResaleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [resale, setResale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    resaleService.getById(id).then(res => {
      const r = res.data.resale
      setResale(r)
      setClaimed(r.claimedBy?._id === user?._id)
    }).catch(() => navigate('/resales')).finally(() => setLoading(false))
  }, [id])

  const handleClaim = async () => {
    try {
      await resaleService.claim(id)
      setResale(prev => ({ ...prev, claimedBy: user, claimedAt: new Date() }))
      setClaimed(true)
    } catch (err) { alert(err.response?.data?.message || err.message) }
  }

  const handleContact = async () => {
    try {
      const res = await resaleService.contactSeller(id)
      const phone = res.data?.phone || resale.seller?.phone
      const msg = `Ciao, sono interessato alla prevendita per "${resale.eventName}".`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    } catch (err) { alert(err.message) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prevendita?')) return
    try { await resaleService.delete(id); navigate('/resales') }
    catch (err) { alert(err.message) }
  }

  const handleMarkAsSold = async () => {
    if (!window.confirm('Segnare questa prevendita come venduta?')) return
    try { await resaleService.markAsSold(id); setResale(prev => ({ ...prev, status: 'sold' })) }
    catch (err) { alert(err.message) }
  }

  const handleReport = async () => {
    const reason = window.prompt('Motivo della segnalazione:')
    if (!reason) return
    try {
      await reportService.create({ targetType: 'resale', targetId: id, reason })
      alert('Segnalazione inviata.')
    } catch (err) { alert(err.message) }
  }

  const handleToggleFavorite = async () => {
    try { await favoriteService.toggle(id); setIsFavorite(prev => !prev) }
    catch (err) { alert(err.message) }
  }

  if (loading) return <LoadingSpinner />
  if (!resale) return <p style={{ color: colors.textSecondary, textAlign: 'center', padding: 40 }}>Prevendita non trovata</p>

  const isOwner = user?._id === resale.seller?._id
  const eventDate = resale.eventDate ? new Date(resale.eventDate) : null
  const daysUntil = eventDate ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24)) : null
  const isExpired = daysUntil !== null && daysUntil < 0
  const discount = resale.originalPrice > 0 ? Math.round((1 - resale.askingPrice / resale.originalPrice) * 100) : 0
  const isClaimed = !!resale.claimedBy
  const claimedByMe = claimed
  const catColor = CAT_COLORS[resale.category] || '#607D8B'
  const hasHero = resale.images?.length > 0

  return (
    <div style={s.page}>
      {hasHero && (
        <div style={s.heroWrap}>
          <img src={resale.images[0]} alt={resale.eventName} style={s.heroImg} />
          <div style={s.heroOverlay} />
          <button style={s.heroFav} onClick={handleToggleFavorite}>
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      )}

      <div style={s.contentCard}>
        <div style={s.headerRow}>
          <div style={{ flex: 1 }}>
            <h1 style={s.eventName}>{resale.eventName}</h1>
            <span style={{ ...s.catBadge, background: `${catColor}1A`, color: catColor }}>
              {resale.category}
            </span>
          </div>
          {!hasHero && (
            <button style={s.heroFav} onClick={handleToggleFavorite}>
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}
        </div>
        <div style={s.locationLine}>
          <span>📍</span>
          <span>{resale.city}{resale.location ? ` — ${resale.location}` : ''}</span>
        </div>
        {eventDate && (
          <div style={s.dateLine}>
            <span>🕐</span>
            <span>
              {eventDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {resale.eventTime ? ` alle ${resale.eventTime}` : ''}
            </span>
          </div>
        )}
      </div>

      <div style={s.countdownCard}>
        <p style={s.countdownText(isExpired)}>
          {isExpired ? '🔴 Event Passed' : `📅 In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div style={s.pricingCard}>
        <div style={s.priceRow}>
          <div style={s.priceLeft}>
            <span style={s.origPrice}>{resale.originalPrice}€</span>
            <span style={s.askPrice}>{resale.askingPrice}€</span>
            {discount > 0 && <span style={s.discBadge}>—{discount}%</span>}
          </div>
          <span style={s.qtyBadge}>
            {resale.quantity} {resale.quantity === 1 ? 'pz' : 'pz'}
          </span>
        </div>
      </div>

      {resale.description && (
        <div style={s.descCard}>
          <h3 style={s.sectionLabel}>Dettagli</h3>
          <p style={s.descText}>{resale.description}</p>
        </div>
      )}

      {resale.images?.length > 1 && (
        <div style={s.galleryCard}>
          <h3 style={s.sectionLabel}>Foto</h3>
          <div style={s.gallery}>
            {resale.images.slice(1).map((img, i) => (
              <img key={i} src={img} alt={`Photo ${i + 2}`} style={s.galleryImg} />
            ))}
          </div>
        </div>
      )}

      {!isOwner && resale.status === 'active' && !isExpired && (
        <>
          {isClaimed ? (
            claimedByMe ? (
              <>
                <div style={s.claimedCard}>
                  <p style={s.claimedTitle}>✓ Ti sei aggiudicato questa prevendita!</p>
                  <p style={s.claimedSub}>Contatta il venditore per organizzare la consegna</p>
                </div>
                <button style={s.whatsappBtn} onClick={handleContact}>
                  <span>💬</span> Contatta su WhatsApp
                </button>
              </>
            ) : (
              <div style={s.claimedOtherCard}>
                <p style={s.claimedOtherText}>⏳ Già aggiudicata da un altro utente</p>
              </div>
            )
          ) : (
            <button style={s.claimBtn} onClick={handleClaim}>
              <span>🏆</span> Aggiudica Prevendita
            </button>
          )}
        </>
      )}

      <div style={s.sellerCard}>
        {resale.seller?.profilePhoto && !resale.seller.profilePhoto.includes('default-avatar')
          ? <img src={resale.seller.profilePhoto} alt="" style={s.avatarRingImg} />
          : <div style={s.avatarRing}>{resale.seller?.firstName?.[0] || '?'}</div>}
        <div style={s.sellerInfo}>
          <div style={s.sellerNameRow}>
            <span style={s.sellerName}>{resale.seller?.firstName} {resale.seller?.lastName}</span>
            {resale.seller?.isPhoneVerified && (
              <span style={s.verifiedBadge}>✓ Verificato</span>
            )}
          </div>
          <StarRating rating={resale.seller?.rating || 0} size={12} />
        </div>
        <button style={s.contactBtn} onClick={handleContact}>Contatta</button>
      </div>

      {isOwner && (
        <div style={s.ownerActions}>
          {resale.status === 'active' && (
            <button style={s.actionBtn(colors.success)} onClick={handleMarkAsSold}>Venduto</button>
          )}
          <button style={s.actionBtn(colors.glass)} onClick={() => navigate(`/resales/edit/${id}`)}>Modifica</button>
          <button style={s.actionBtn(colors.error)} onClick={handleDelete}>Elimina</button>
        </div>
      )}

      <button style={s.reportBtn} onClick={handleReport}>Segnala annuncio</button>
    </div>
  )
}
