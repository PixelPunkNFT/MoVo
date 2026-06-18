import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../config/theme';

const COLORS = {
  gold1: '#D4AF37',
  gold2: '#F0D060',
  gold3: '#FFF8DC',
  pink1: '#D4AF37',
  pink2: '#E8C84A',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (isAuthenticated) {
    navigate('/home', { replace: true });
    return null;
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes splash-anim {
          0%   { transform: scale(0.4); opacity: 0.8; }
          40%  { opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(3deg); } }
        @keyframes drive { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } }
        .icon-anim-car { animation: drive 2s ease-in-out infinite; }
        .icon-anim-ticket { animation: sway 2.4s ease-in-out infinite; }
        .icon-anim-chat { animation: float 2s ease-in-out infinite; }
        .icon-anim-check { animation: pulse 2.2s ease-in-out infinite; }
          0%   { transform: scale(0.4); opacity: 0.8; }
          40%  { opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .nav-menu { display: contents; }
        .icon-node:hover { transform: translateY(-1px); }
        .icon-node:active { box-shadow: inset 6px 6px 12px rgba(0,0,0,0.4), inset -4px -4px 10px rgba(255,255,255,0.03) !important; }
        .icon-node::after { content: ''; position: absolute; inset: -7px; border-radius: 50%; border: 1px dotted #1a1a24; pointer-events: none; }
        .node-light-right::before,
        .node-light-left::before { content: ''; position: absolute; inset: 0; border-radius: 50%; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
        .node-light-right.active::before { opacity: 1; background: radial-gradient(circle at right, rgba(200,200,200,0.45) 0%, transparent 70%); }
        .node-light-left.active::before { opacity: 1; background: radial-gradient(circle at left, rgba(212,175,55,0.5) 0%, transparent 70%); }
        .splash.animate { animation: splash-anim 0.8s ease-out forwards; }
        @media (max-width: 768px) {
          nav { display: flex !important; justify-content: space-between; align-items: center; }
          .nav-menu { position: fixed; top: 0; right: -100%; width: 100%; height: 100vh; background: #0a0a0f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; transition: right 0.4s cubic-bezier(0.4,0,0.2,1); z-index: 1000; }
          .nav-menu.active { right: 0; }
          .nav-links { flex-direction: column; align-items: center; gap: 24px; }
          .nav-actions { flex-direction: column; gap: 12px; margin-top: 12px; }
          .menu-toggle { display: flex !important; }
          .pipeline-line { width: 60px !important; }
          .hero-card { padding: 48px 18px 48px !important; min-height: auto !important; }
          .icon-node { width: 38px !important; height: 38px !important; }
          .icon-node svg { width: 18px !important; height: 18px !important; }
          .icon-node-center { width: 52px !important; height: 52px !important; }
          .icon-node-center svg { width: 24px !important; height: 24px !important; }
          .brands { gap: 32px !important; }
        }
        @media (max-width: 860px) {
          .icon-pipeline { gap: 0 !important; margin-bottom: 40px !important; }
          .pipeline-line { width: 80px; }
        }
        @media (max-width: 480px) {
          .hero-card { border-radius: 16px !important; }
          .brands { gap: 24px !important; }
        }
      `}</style>

      <nav style={s.nav}>
        <img src="/Movo.png" alt="Movo" style={{ height: 144, width: 'auto' }} />
        <div className={`nav-menu${mobileOpen ? ' active' : ''}`}>
          
          <div className="nav-actions" style={s.navActions}>
            <Link to="/login" style={s.btnLogin}>Accedi</Link>
            <Link to="/register" style={s.btnSignup}>Registrati</Link>
          </div>
        </div>
        <button className="menu-toggle" style={s.menuToggle} onClick={() => setMobileOpen(o => !o)}>
          <span style={{ ...s.menuBar, transform: mobileOpen ? 'translateY(6px) rotate(45deg)' : 'none' }} />
          <span style={{ ...s.menuBar, transform: mobileOpen ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      <HeroSection />
      <BrandsRow />
    </div>
  );
}

function HeroSection() {
  const pipelineRef = useRef(null);
  const nodeStackRef = useRef(null);
  const nodeXRef = useRef(null);
  const nodeShieldRef = useRef(null);
  const splashRef = useRef(null);

  const computePath = useCallback(() => {
    const p = pipelineRef.current;
    const s = nodeStackRef.current;
    const x = nodeXRef.current;
    const sh = nodeShieldRef.current;
    if (!p || !s || !x || !sh) return null;
    const pR = p.getBoundingClientRect();
    const sR = s.getBoundingClientRect();
    const xR = x.getBoundingClientRect();
    const shR = sh.getBoundingClientRect();
    return {
      startX: sR.left + sR.width / 2 - pR.left,
      startY: sR.top + sR.height / 2 - pR.top,
      midX: xR.left + xR.width / 2 - pR.left,
      midY: xR.top + xR.height / 2 - pR.top,
      endX: shR.left + shR.width / 2 - pR.left,
      endY: shR.top + shR.height / 2 - pR.top,
    };
  }, []);

  useEffect(() => {
    const bg = document.getElementById('beam-glow');
    const bc = document.getElementById('beam-core');
    const g = document.getElementById('beam-gradient');
    const s = nodeStackRef.current;
    const sh = nodeShieldRef.current;
    const splash = splashRef.current;
    if (!bg || !bc || !g || !s || !sh || !splash) return;

    const updatePath = () => {
      const pts = computePath();
      if (!pts) return;
      const d = `M ${pts.startX},${pts.startY} L ${pts.midX},${pts.midY} L ${pts.endX},${pts.endY}`;
      bg.setAttribute('d', d);
      bc.setAttribute('d', d);
    };
    updatePath();

    let phase = 'p1';
    let lastChange = performance.now();
    const duration = 800;
    const idleDuration = 1000;
    let rafId;

    const tick = (now) => {
      const elapsed = now - lastChange;

      if (phase === 'p1') {
        const t = Math.min(elapsed / duration, 1);
        const center = t * 0.5;
        const hw = 5;
        g.setAttribute('x1', `${(center - hw) * 100}%`);
        g.setAttribute('x2', `${(center + hw) * 100}%`);

        if (t < 0.4) s.classList.add('active');
        else s.classList.remove('active');

        if (t >= 1) {
          phase = 'splash';
          lastChange = now;
          bg.style.opacity = '0';
          bc.style.opacity = '0';
          splash.classList.add('animate');
        }
      } else if (phase === 'splash') {
        if (elapsed >= duration) {
          phase = 'p2';
          lastChange = now;
          splash.classList.remove('animate');
          bg.style.opacity = '1';
          bc.style.opacity = '1';
        }
      } else if (phase === 'p2') {
        const t = Math.min(elapsed / duration, 1);
        const center = 0.5 + t * 0.5;
        const hw = 5;
        g.setAttribute('x1', `${(center - hw) * 100}%`);
        g.setAttribute('x2', `${(center + hw) * 100}%`);

        if (t > 0.6) sh.classList.add('active');
        if (t >= 1) {
          sh.classList.remove('active');
          phase = 'idle';
          lastChange = now;
        }
      } else if (phase === 'idle') {
        if (elapsed >= idleDuration) {
          phase = 'p1';
          lastChange = now;
          s.classList.remove('active');
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onResize = () => updatePath();
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, [computePath]);

  return (
    <section className="hero-card" style={s.heroCard}>
      <div style={s.heroArc} />
      <div style={s.heroGrid} />

      <div ref={pipelineRef} className="icon-pipeline" style={s.pipeline}>
        <svg className="beam-svg" style={s.beamSvg}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={COLORS.gold1} stopOpacity="0" />
              <stop offset="20%" stopColor={COLORS.gold1} stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fff" stopOpacity="1" />
              <stop offset="80%" stopColor={COLORS.gold2} stopOpacity="0.8" />
              <stop offset="100%" stopColor={COLORS.gold2} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path id="beam-glow" stroke="url(#beam-gradient)" strokeWidth="2" fill="none" filter="url(#glow)" opacity="0.6" />
          <path id="beam-core" stroke="url(#beam-gradient)" strokeWidth="0.8" fill="none" />
        </svg>

        <div ref={nodeStackRef} className="icon-node node-light-right" id="node-stack" style={s.iconNode}>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>

        <div className="pipeline-line" style={s.pipelineLine} />

        <div style={{ position: 'relative' }}>
          <div ref={splashRef} className="splash" style={s.splash} />
          <div ref={nodeXRef} className="icon-node-center" id="node-x" style={s.iconNodeCenter}>
            <svg viewBox="0 0 40 40" fill="white" style={{ width: 28, height: 28 }}>
              <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16 Z" />
            </svg>
          </div>
        </div>

        <div className="pipeline-line right" style={{ ...s.pipelineLine, background: 'linear-gradient(270deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07))' }} />

        <div ref={nodeShieldRef} className="icon-node node-light-left" id="node-shield" style={s.iconNode}>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
      </div>

      <div className="hero-content" style={s.heroContent}>
        <h1 style={s.heading}>
          Il modo più semplice per
          <strong style={s.headingStrong}>viaggiare e vivere la community</strong>
        </h1>
        <p style={s.sub}>
          Passaggi in auto e prevendite biglietti per eventi della community latina di Roma.
          <br />
          Condividi, vendi, e incontrati in tutta sicurezza.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={s.btnCta}>Inizia ora</Link>
          
        </div>
      </div>

      <div id="features" style={s.features}>
        {[
          { icon: '🚗', title: 'Passaggi in Auto', desc: 'Pubblica o prenota passaggi per eventi. Condividi il viaggio con la community.' },
          { icon: '🎟️', title: 'Prevendite Biglietti', desc: 'Rivendi biglietti in sicurezza. Foto obbligatorie e limite antispam.' },
          { icon: '💬', title: 'Chat Integrata', desc: 'Comunica direttamente con autisti e venditori tramite chat in tempo reale.' },
          { icon: '✅', title: 'Verifica OTP', desc: 'Account verificato via email per pubblicare in sicurezza.' },
        ].map(f => (
          <div key={f.title} style={s.featureCard}>
            <span style={{ fontSize: 28 }}>{f.icon}</span>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandsRow() {
  return (
    <div className="brands" style={s.brands}>
      {[
        
      ].map(b => (
        <div key={b.name} style={s.brandItem}>
          <span style={{ fontSize: 22 }}>{b.icon}</span>
          <span style={s.brandName}>{b.name}</span>
        </div>
      ))}
    </div>
  );
}

const s = {
  page: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 14, background: '#0a0a0f', minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    color: '#f0f0f5',
  },

  nav: {
    display: 'grid', gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center', padding: '12px 24px', marginBottom: 14,
    width: '100%', maxWidth: 1600, boxSizing: 'border-box',
    position: 'relative',
  },
  logo: { fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#f0f0f5' },
  navLinks: { display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0, justifyContent: 'center' },
  navLink: { color: '#8888a8', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer', fontFamily: "'Inter', sans-serif" },
  navActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' },
  btnLogin: {
    padding: '7px 18px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 500,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', textDecoration: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    transition: 'background 0.2s',
  },
  btnSignup: {
    padding: '7px 18px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600,
    background: '#fff', border: 'none', color: '#0a0a0f', textDecoration: 'none',
    cursor: 'pointer', fontFamily: "'Inter', sans-serif",
    transition: 'opacity 0.2s',
  },
  menuToggle: { display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 4, zIndex: 1001 },
  menuBar: { display: 'block', width: 24, height: 2, background: '#fff', borderRadius: 2, transition: 'transform 0.3s ease' },

  heroCard: {
    width: '100%', maxWidth: 1600, borderRadius: 20, border: '1px solid rgba(255,255,255,0.07)',
    overflow: 'hidden', position: 'relative', background: '#0d0b12',
    padding: '80px 40px 70px', minHeight: 640, display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center', boxSizing: 'border-box',
  },

  heroArc: {
    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: `
      radial-gradient(circle at 50% -70%,
        transparent 60%,
        rgba(212,175,55,0.03) 63%,
        rgba(212,175,55,0.08) 65%,
        rgba(212,175,55,0.16) 67%,
        rgba(212,175,55,0.28) 69%,
        rgba(212,175,55,0.40) 71%,
        rgba(212,175,55,0.52) 73%,
        rgba(212,175,55,0.64) 75%,
        rgba(212,175,55,0.74) 77%,
        rgba(212,175,55,0.82) 79%,
        rgba(240,208,96,0.92) 85%,
        rgba(240,208,96,0.88) 87%,
        rgba(255,248,220,0.92) 91%,
        rgba(255,252,240,0.98) 93%,
        #ffffff 95%),
      radial-gradient(circle at 50% 35%, rgba(212,175,55,0.08) 0%, transparent 50%)
    `,
  },

  heroGrid: {
    position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    maskImage: 'radial-gradient(circle at 50% -70%, transparent 60%, black 78%)',
    WebkitMaskImage: 'radial-gradient(circle at 50% -70%, transparent 60%, black 78%)',
  },

  pipeline: {
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
    maxWidth: 700, marginBottom: 52, zIndex: 1, width: '100%',
  },

  beamSvg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2,
    overflow: 'visible', pointerEvents: 'none',
  },

  iconNode: {
    width: 46, height: 46, borderRadius: '50%', background: '#1a1a24',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    zIndex: 3, position: 'relative', flexShrink: 0,
    boxShadow: '6px 6px 12px rgba(0,0,0,0.4), -4px -4px 10px rgba(255,255,255,0.03), inset 1px 1px 1px rgba(255,255,255,0.05), inset 4px 4px 8px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  iconNodeCenter: {
    width: 64, height: 64, borderRadius: '50%', background: '#1e1e2c',
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
    zIndex: 3,
    boxShadow: '8px 8px 16px rgba(0,0,0,0.5), -6px -6px 14px rgba(255,255,255,0.04), inset 1px 1px 2px rgba(255,255,255,0.06), inset 6px 6px 12px rgba(0,0,0,0.5)',
  },

  pipelineLine: {
    width: 160, height: 1,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.07))',
    flexShrink: 0,
  },

  splash: {
    position: 'absolute', top: '50%', left: '50%', width: 100, height: 100,
    borderRadius: '50%', transform: 'translate(-50%, -50%)',
    background: 'radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)',
    opacity: 0, zIndex: 2, pointerEvents: 'none',
  },

  heroContent: { maxWidth: 620, zIndex: 1, padding: '0 16px' },
  heading: {
    fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 300,
    lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 20px',
  },
  headingStrong: {
    display: 'block', fontWeight: 400, marginTop: 4,
    background: 'linear-gradient(to right, #ffffff, #a98597)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  sub: {
    fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', maxWidth: 440,
    margin: '0 auto 36px', lineHeight: 1.6,
  },
  btnCta: {
    display: 'inline-block', padding: '12px 32px', borderRadius: 999,
    background: '#fff', color: '#0a0a0f', fontWeight: 600, fontSize: '0.9rem',
    textDecoration: 'none', transition: 'opacity 0.2s, transform 0.2s',
  },
  btnGhost: {
    display: 'inline-block', padding: '12px 32px', borderRadius: 999,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontWeight: 500, fontSize: '0.9rem', textDecoration: 'none',
    cursor: 'pointer',
  },

  features: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12, width: '100%', maxWidth: 960, marginTop: 56, zIndex: 1,
  },
  featureCard: {
    padding: 24, textAlign: 'center',
  },
  featureTitle: { fontSize: '0.9rem', fontWeight: 600, margin: '12px 0 6px', color: '#0a0a0f', letterSpacing: '-0.01em' },
  featureDesc: { fontSize: '0.78rem', color: '#0a0a0f', lineHeight: 1.6, margin: 0, opacity: 0.7 },

  brands: {
    display: 'flex', gap: 64, padding: '32px 24px 10px',
    flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1600, width: '100%',
    boxSizing: 'border-box',
  },
  brandItem: { display: 'flex', gap: 10, alignItems: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem', fontWeight: 500, whiteSpace: 'nowrap' },
  brandName: { color: 'rgba(255,255,255,0.35)', textDecoration: 'none' },
};
