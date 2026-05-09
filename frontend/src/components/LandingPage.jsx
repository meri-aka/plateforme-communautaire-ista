import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Clock, Heart, MessageCircle, Share2, Sparkles, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BrandLogo from './admin/common/BrandLogo';

const AnimatedCounter = ({ target, suffix, startAnim, duration = 2000, decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startAnim) return;
    let startTimestamp = null;
    let animationFrame;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * target);
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };
    animationFrame = window.requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, startAnim]);

  return <>{count.toFixed(decimals)}{suffix}</>;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lettersDone, setLettersDone] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    const t = setTimeout(() => setReady(true), 150);
    const t2 = setTimeout(() => setLettersDone(true), 1800);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  /* Split text into animated spans */
  const AnimWord = ({ text, color, delay = 0 }) => (
    <span style={{ display: 'inline-block' }}>
      {text.split('').map((ch, i) => (
        <span key={i} style={{
          display: 'inline-block',
          opacity: ready ? 1 : 0,
          transform: ready ? 'translateY(0) rotateX(0deg)' : 'translateY(40px) rotateX(-90deg)',
          transition: `opacity 0.5s ease ${delay + i * 0.03}s, transform 0.5s cubic-bezier(0.2,1,0.3,1) ${delay + i * 0.03}s`,
          color: color ?? 'inherit',
          transformOrigin: 'bottom center',
          ...(ch === ' ' ? { width: '0.3em' } : {}),
        }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );

  return (
    <div style={{
      width: '100vw', height: '100vh', overflow: 'hidden',
      position: 'relative', background: '#0a120c',
      color: '#fff', fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── BG ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.5, filter: 'contrast(1.1) brightness(0.9)',
        }}>
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0a120c 0%, rgba(10,18,12,0.88) 35%, rgba(10,18,12,0.25) 68%, rgba(10,18,12,0) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #0a120c 0%, transparent 28%)' }} />
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)', borderRadius: '50%',
          transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`,
          transition: 'transform 0.1s ease-out', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(26,61,26,0.5) 0%, transparent 70%)',
          filter: 'blur(100px)', borderRadius: '50%',
          transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
          transition: 'transform 0.1s ease-out', mixBlendMode: 'screen', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'relative', zIndex: 100, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', padding: '0 5vw',
        opacity: ready ? 1 : 0,
        transform: ready ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.7s cubic-bezier(0.2,1,0.3,1) 0.1s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <BrandLogo size={32} />
          <div style={{ position: 'relative' }}>
            <Sparkles size={12} color="#d4af37" style={{ position: 'absolute', top: -8, left: -14, animation: 'pulse 2s infinite' }} />
            <div style={{ fontSize: '17px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
              ISTA<span style={{ color: '#d4af37' }}>Connect</span>
            </div>
            <div style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(212,175,55,0.7)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '3px' }}>
              Édition Pro-Max
            </div>
            <Sparkles size={10} color="var(--brand)" style={{ position: 'absolute', bottom: -6, right: -12, animation: 'pulse 2.5s infinite reverse' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme} style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#d4af37', transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'rotate(15deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.05)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button onClick={() => navigate('/login')} style={{
            padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Se Connecter
          </button>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 10, flex: 1, minHeight: 0,
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', alignItems: 'center',
        padding: '0 5vw 60px', gap: '32px',
      }}>

        {/* LEFT */}
        <div style={{ perspective: '600px' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(90deg, rgba(212,175,55,0.1), transparent)',
            border: '1px solid rgba(212,175,55,0.3)', borderLeft: '3px solid #d4af37',
            padding: '6px 14px', borderRadius: '4px', marginBottom: '20px',
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateX(0)' : 'translateX(-30px)',
            transition: 'all 0.6s cubic-bezier(0.2,1,0.3,1) 0.1s',
          }}>
            <Star size={12} color="#d4af37" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#d4af37', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              L'Expérience Premium ISTA
            </span>
          </div>

          {/* Headline — letter-by-letter */}
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 76px)',
            fontWeight: 900, lineHeight: 1.05,
            letterSpacing: '-0.03em', margin: '0 0 18px 0',
            textShadow: '0 20px 40px rgba(0,0,0,0.5)',
            perspective: '400px',
          }}>
            <span style={{ display: 'block', color: '#fff' }}>
              <AnimWord text="L'Excellence" delay={0.2} />
              {' '}
              <AnimWord text="de" delay={0.5} />
              {' '}
              <AnimWord text="la" delay={0.6} />
            </span>
            <span style={{ display: 'block' }}>
              {lettersDone ? (
                <span style={{
                  background: 'linear-gradient(90deg, #d4af37, #f9e596, #d4af37, #b28d22)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  animation: 'textShimmer 3s linear infinite',
                  filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.25))',
                  display: 'inline-block',
                }}>
                  Communauté.
                </span>
              ) : (
                <span style={{ color: '#d4af37', display: 'inline-block' }}>
                  <AnimWord text="Communauté." delay={0.75} />
                </span>
              )}
            </span>
          </h1>

          {/* Sub — fade + slide up */}
          <p style={{
            fontSize: 'clamp(13px, 1.1vw, 16px)',
            color: 'rgba(255,255,255,0.58)', lineHeight: 1.75,
            maxWidth: '440px', margin: '0 0 28px 0', fontWeight: 400,
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.2,1,0.3,1) 0.9s',
          }}>
            Un espace exclusif conçu pour les esprits brillants. Partagez, innovez et élevez votre parcours académique au sein du réseau d'élite de l'ISTA Marrakech.
          </p>

          {/* CTA — pop in */}
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 36px', borderRadius: '16px', fontSize: '15px', fontWeight: 900,
              background: 'linear-gradient(135deg, #d4af37, #f9e596, #b28d22)', backgroundSize: '200% auto',
              color: '#0a120c', textTransform: 'uppercase', letterSpacing: '0.05em',
              border: 'none', cursor: 'pointer', overflow: 'hidden', position: 'relative',
              boxShadow: '0 16px 36px -10px rgba(212,175,55,0.5), inset 0 2px 0 rgba(255,255,255,0.4)',
              transition: 'all 0.3s cubic-bezier(0.2,1,0.3,1)',
              opacity: ready ? 1 : 0,
              transform: ready ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transitionDelay: '1.05s',
              animation: 'textShimmer 3s linear infinite',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'; e.currentTarget.style.boxShadow = '0 24px 44px -12px rgba(212,175,55,0.8), 0 0 30px rgba(212,175,55,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 16px 36px -10px rgba(212,175,55,0.5), inset 0 2px 0 rgba(255,255,255,0.4)'; }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>Rejoindre l'Élite</span>
            <ArrowRight size={18} style={{ position: 'relative', zIndex: 2 }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              transform: 'translateX(-100%)', animation: 'shimmer 2.5s infinite',
            }} />
          </button>

          {/* Stats — stagger in */}
          <div style={{ display: 'flex', gap: '40px', margin: '28px 0 0 0' }}>
            {[
              { target: 1.5, decimals: 1, suffix: 'k+', label: 'Membres Actifs', d: 1.15 },
              { target: 500, decimals: 0, suffix: '+',  label: 'Projets Réalisés', d: 1.25 },
              { isStatic: true, val: '24/7', label: 'Accès Réseau', d: 1.35 },
            ].map((s) => (
              <div key={s.label} style={{
                position: 'relative',
                opacity: ready ? 1 : 0,
                transform: ready ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.6s ease ${s.d}s, transform 0.6s cubic-bezier(0.2,1,0.3,1) ${s.d}s`,
              }}>
                <div style={{ position: 'absolute', left: '-10px', top: '4px', width: '2px', height: '80%', background: 'linear-gradient(to bottom, #d4af37, transparent)' }} />
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                  {s.isStatic ? s.val : <AnimatedCounter target={s.target} decimals={s.decimals} suffix={s.suffix} startAnim={ready} duration={2500} />}
                </div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(212,175,55,0.75)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', perspective: '1000px',
          opacity: ready ? 1 : 0, transform: ready ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(30px)',
          transition: 'all 1.1s cubic-bezier(0.16,1,0.3,1) 0.5s',
        }}>

          {/* Glass Card */}
          <div style={{
            width: '100%', maxWidth: '400px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(212,175,55,0.3)', borderRadius: '24px', padding: '24px',
            backdropFilter: 'blur(30px)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8), inset 0 0 20px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,255,255,0.2)',
            position: 'relative', zIndex: 10,
            transform: `rotateX(${mousePos.y * -0.6}deg) rotateY(${mousePos.x * 0.6}deg)`,
            transition: 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', transform: 'translateZ(20px)' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
                background: 'linear-gradient(135deg, #1a3d1a, #0a120c)',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                fontWeight: 900, color: '#d4af37', fontSize: '14px',
              }}>
                SA
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Salma Ammari
                  <div style={{ width: '13px', height: '13px', background: '#d4af37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={7} color="#0a120c" />
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(212,175,55,0.7)', marginTop: '2px', fontWeight: 600 }}>Développement Digital · À l'instant</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, margin: '0 0 16px 0', transform: 'translateZ(30px)' }}>
              L'atelier sur l'Intelligence Artificielle de ce matin était incroyable. Quelqu'un veut collaborer sur un projet de Machine Learning ce weekend ? 🧠✨
            </p>

            <div style={{
              width: '100%', height: '130px', borderRadius: '14px', overflow: 'hidden',
              background: 'linear-gradient(45deg, #0a120c, #1a3d1a)',
              border: '1px solid rgba(212,175,55,0.15)',
              marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'translateZ(40px)', position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'url("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop") center/cover', opacity: 0.4, mixBlendMode: 'overlay' }} />
              <Sparkles size={40} color="#d4af37" style={{ opacity: 0.8, filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', transform: 'translateZ(20px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 700, color: '#d4af37', cursor: 'pointer', background: 'rgba(212,175,55,0.1)', padding: '5px 10px', borderRadius: '7px' }}>
                <Heart size={13} fill="#d4af37" /> 142
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
              >
                <MessageCircle size={13} /> 38
              </div>
              <div style={{ marginLeft: 'auto', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                <Share2 size={13} />
              </div>
            </div>
          </div>

          {/* Chip 1 */}
          <div style={{
            position: 'absolute', top: '12%', right: '-4%', zIndex: 20,
            padding: '10px 16px',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.4)', borderRadius: '14px', backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
            animation: 'floatSlow 7s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg, #d4af37, #b28d22)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(212,175,55,0.4)' }}>
                <Clock size={12} color="#0a120c" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Hackathon 2026</span>
            </div>
          </div>

          {/* Chip 2 */}
          <div style={{
            position: 'absolute', bottom: '12%', left: '-8%', zIndex: 20,
            padding: '9px 14px', background: 'rgba(10,18,12,0.65)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)',
            boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
            animation: 'floatFast 5s ease-in-out infinite reverse',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
              <div style={{ position: 'relative', width: '9px', height: '9px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>340 en ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100, height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw',
        borderTop: '1px solid rgba(212,175,55,0.08)',
        background: 'linear-gradient(to top, rgba(10,18,12,0.98), transparent)',
      }}>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.1em' }}>
          © 2026 ISTA CONNECT · <span style={{ color: 'rgba(212,175,55,0.5)' }}>ÉDITION PREMIUM</span>
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          {['Confidentialité', 'Conditions', 'Support VIP'].map((item) => (
            <span key={item}
              style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.3s', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#d4af37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >{item}</span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(1.5deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes textShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}