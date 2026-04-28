import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Clock, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './admin/common/BrandLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/feed', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#040604',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Video BG ── */}
      <video autoPlay muted loop playsInline style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: 'cover', zIndex: 0, opacity: 0.45,
        filter: 'grayscale(0.2) contrast(1.1)',
      }}>
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* ── Overlays ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(90deg, #040604 0%, rgba(4,6,4,0.88) 35%, rgba(4,6,4,0.55) 65%, rgba(4,6,4,0.15) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(0deg, #040604 0%, transparent 35%)' }} />

      {/* ── Glow ── */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-5%', zIndex: 2,
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,179,66,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* ══════════════════════════════
          NAVBAR
          — flex row, fixed 72px height, never wraps
      ══════════════════════════════ */}
      <nav style={{
        position: 'relative',
        zIndex: 100,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        paddingLeft: '40px',
        paddingRight: '40px',
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.8s ease 0.15s',
      }}>

        {/* LEFT: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrandLogo size={34} />
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1 }}>
              ISTA<span style={{ color: '#7BB342' }}>Connect</span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '3px' }}>
              Premium Portal
            </div>
          </div>
        </div>

        {/* RIGHT: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={toggleTheme} style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', transition: 'background 0.2s',
          }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: '9px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
          }}>
            Se connecter
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════
          MAIN CONTENT
          — fills remaining space between nav & footer
      ══════════════════════════════ */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingBottom: '56px', /* don't underlap footer */
      }}>

        {/* LEFT col */}
        <div style={{
          paddingRight: '24px',
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.9s cubic-bezier(0.2,1,0.3,1) 0.1s',
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(123,179,66,0.1)', border: '1px solid rgba(123,179,66,0.22)',
            padding: '6px 13px', borderRadius: '100px', marginBottom: '26px',
          }}>
            <Sparkles size={12} color="#7BB342" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#7BB342', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Plateforme Officielle · ISTA Marrakech
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(34px, 4.8vw, 80px)',
            fontWeight: 900, lineHeight: 0.92,
            letterSpacing: '-0.04em', margin: '0 0 22px 0',
          }}>
            <span style={{ display: 'block', color: '#fff' }}>Redéfinir la</span>
            <span style={{
              display: 'block',
              background: 'linear-gradient(90deg, #7BB342, #b4e07d)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Communauté.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(12px, 1.05vw, 15px)',
            color: 'rgba(255,255,255,0.46)', lineHeight: 1.65,
            maxWidth: '400px', margin: '0 0 32px 0',
          }}>
            Connectez-vous avec vos pairs, partagez vos connaissances et explorez les opportunités au sein de l'écosystème ISTA.
          </p>

          {/* CTA */}
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
              background: '#7BB342', color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 14px 32px -8px rgba(123,179,66,0.45)', transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(123,179,66,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 14px 32px -8px rgba(123,179,66,0.45)'; }}
          >
            Commencer l'aventure <ArrowRight size={15} />
          </button>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '32px', marginTop: '40px',
            opacity: ready ? 1 : 0, transition: 'opacity 1s ease 0.7s',
          }}>
            {[{ val: '1.2k+', label: 'Étudiants' }, { val: '45+', label: 'Formateurs' }, { val: '12', label: 'Spécialités' }].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{s.val}</div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT col */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          opacity: ready ? 1 : 0,
          transform: ready ? 'scale(1)' : 'scale(0.94)',
          transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.35s',
        }}>

          {/* Card */}
          <div style={{
            width: '100%', maxWidth: '340px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '22px', padding: '18px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 70px -20px rgba(0,0,0,0.6)',
            position: 'relative', zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                background: '#7BB342', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '13px', color: '#fff',
              }}>A</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Amine Benali</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginTop: '1px' }}>Développement Digital · 2h ago</div>
              </div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7BB342', boxShadow: '0 0 6px #7BB342', flexShrink: 0 }} />
            </div>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              Quelqu'un a-t-il des ressources sur React &amp; Framer Motion ? Je prépare un atelier pour la semaine prochaine au Lab. 🚀
            </p>

            <div style={{
              width: '100%', height: '120px', borderRadius: '14px',
              background: 'rgba(123,179,66,0.07)', border: '1px solid rgba(123,179,66,0.1)',
              marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={36} color="#7BB342" style={{ opacity: 0.2 }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.38)', cursor: 'pointer' }}><Heart size={13} /> 24</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.38)', cursor: 'pointer' }}><MessageCircle size={13} /> 8</div>
              <div style={{ marginLeft: 'auto', cursor: 'pointer' }}><Share2 size={13} color="rgba(255,255,255,0.25)" /></div>
            </div>
          </div>

          {/* Chip top-right — inset so it doesn't escape the column */}
          <div style={{
            position: 'absolute', top: '22%', right: '4px', zIndex: 20,
            padding: '9px 14px',
            background: 'rgba(123,179,66,0.15)', border: '1px solid rgba(123,179,66,0.3)',
            borderRadius: '14px', backdropFilter: 'blur(14px)',
            animation: 'chipFloat 6s ease-in-out infinite', pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
              <div style={{ width: '22px', height: '22px', background: '#7BB342', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={11} color="#fff" />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Avis: Workshop React</span>
            </div>
          </div>

          {/* Chip bottom-left */}
          <div style={{
            position: 'absolute', bottom: '24%', left: '4px', zIndex: 9,
            padding: '8px 13px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', backdropFilter: 'blur(14px)',
            animation: 'chipFloatAlt 8s ease-in-out infinite', pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F43F5E', flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.52)' }}>Nouvel objet perdu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 100, height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingLeft: '40px', paddingRight: '40px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(to top, rgba(4,6,4,0.8), transparent)',
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', fontWeight: 600, letterSpacing: '0.05em' }}>
          © 2025 ISTA CONNECT · TOUS DROITS RÉSERVÉS
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Confidentialité', 'Conditions', 'Contact'].map((item) => (
            <span key={item}
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', cursor: 'pointer', transition: 'color 0.2s', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.color = '#7BB342'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
            >{item}</span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes chipFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes chipFloatAlt {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(9px); }
        }
      `}</style>
    </div>
  );
}