import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Mail, KeyRound, ArrowRight, Loader2,
  AlertCircle, Cpu, Sun, Moon, Globe
} from 'lucide-react';

// ── Components ──────────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const duration = 2000;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(easeOut * target);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [target]);
  return <>{count.toFixed(decimals)}{suffix}</>;
};

// ── Theme & Lang Toggles ──────────────────────────────────────────────────────
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="transition-all hover:scale-110 active:scale-95 z-[100] absolute top-6 right-[100px] w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--brand)] group"
      style={{
        background: 'rgba(var(--bg-elevated-rgb), 0.1)',
        boxShadow: 'var(--shadow-premium)',
      }}
    >
      <Sun size={18} className="theme-icon-dark text-[var(--brand)] transition-transform group-hover:rotate-45" />
      <Moon size={18} className="theme-icon-light text-[var(--brand)] transition-transform group-hover:-rotate-12" />
    </button>
  );
};

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  return (
    <button
      onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
      className="transition-all hover:scale-105 active:scale-95 z-[100] absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer font-bold text-[11px] uppercase tracking-wider backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--brand)]"
      style={{
        color: 'var(--text-primary)',
        background: 'rgba(var(--bg-elevated-rgb), 0.1)'
      }}
    >
      <Globe size={14} className="text-[var(--brand)]" /> {i18n.language.toUpperCase()}
    </button>
  );
};

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [mode, setMode] = useState('login'); // login, forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initSequence, setInitSequence] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setInitSequence(1), 100),
      setTimeout(() => setInitSequence(2), 250),
      setTimeout(() => setInitSequence(3), 400),
      setTimeout(() => setInitSequence(4), 550),
    ];
    return () => timers.forEach(clearTimeout);
  }, []); // Only on mount

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 40;
    const y = (clientY - window.innerHeight / 2) / 40;
    setMousePos({ x, y });
  };

  if (authLoading) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const u = await login(email, password);
        if (u.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          setError(t('login.admin_only') || 'Admin access only');
        }
      } else {
        await new Promise(r => setTimeout(r, 1500));
        setSuccess(t('login.reset_sent') || 'Reset link sent to your email');
      }
    } catch (err) {
      setError(err.response?.data?.message || t('login.failed') || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[var(--bg-main)] flex overflow-hidden font-['Inter'] relative"
      onMouseMove={handleMouseMove}
    >
      <ThemeToggle />
      <LanguageToggle />

      {/* Decorative Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.4; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes mesh { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(10%,10%) scale(1.1); } }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--text-primary);
          -webkit-box-shadow: 0 0 0px 1000px var(--bg-card-hover) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        input { color-scheme: ${theme === 'dark' ? 'dark' : 'light'}; }
      `}</style>

      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-none relative items-end p-12 xl:p-16 overflow-hidden">
        
        {/* Video Background with overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay loop muted playsInline
            className="w-full h-full object-cover"
            src="/Video 1.mp4"
            style={{ transform: `translate(${mousePos.x / 2}px, ${mousePos.y / 2}px)`, transition: 'transform 0.1s ease-out' }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-grayscale-[0.2]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
        
        {/* Floating Light Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] pointer-events-none animate-pulse" 
             style={{ 
               background: 'radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)', 
               opacity: 0.4,
               transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` 
             }}/>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] pointer-events-none" 
             style={{ 
               background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)', 
               opacity: 0.3,
               transform: `translate(${-mousePos.x * 3}px, ${-mousePos.y * 3}px)`
             }}/>

        <div className="relative z-10 max-w-[540px]" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 backdrop-blur-md border border-white/10 bg-white/5 shadow-2xl">
             <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
             <span className="text-[10px] font-black text-white/90 tracking-[0.2em] uppercase">Control Center</span>
          </div>
          
          <h2 className="text-[42px] xl:text-[54px] font-black mb-6 leading-[0.95] tracking-tight text-white">
            Managing <br/>
            <span className="text-[var(--brand)]">the future.</span>
          </h2>
          
          <p className="text-[15px] xl:text-[17px] leading-relaxed text-white/70 font-medium max-w-[400px]">
            The official administrative gateway for ISTAConnect. Secure, powerful, and built for excellence.
          </p>
          
          <div className="mt-10 flex items-center gap-8 border-t border-white/10 pt-10">
            <div className="group/stat">
              <div className="text-xl font-bold text-white tracking-tighter group-hover/stat:text-[var(--brand)] transition-colors">
                ADMIN
              </div>
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Access Level</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="group/stat">
              <div className="text-xl font-bold text-white tracking-tighter group-hover/stat:text-[var(--brand)] transition-colors">
                SECURE
              </div>
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 lg:w-1/2 flex-none flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10 bg-[var(--bg-main)]">
        
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[var(--brand)] blur-[120px] animate-[mesh_20s_infinite_alternate]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[var(--gold-glow)] blur-[120px] animate-[mesh_25s_infinite_alternate-reverse]" />
        </div>

        <div className="w-full max-w-[480px] relative z-10">
          
          {/* Main Floating Glass Card with 3D Parallax */}
          <div 
            className="pro-glass rounded-[40px] p-8 sm:p-12 shadow-2xl relative overflow-hidden group/card border-t border-l border-white/10 transition-transform duration-200 ease-out"
            style={{ 
              transform: `perspective(1000px) rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)`,
              boxShadow: `${-mousePos.x}px ${-mousePos.y}px 50px -10px rgba(0,0,0,0.3)`
            }}
          >
            
            {/* Dynamic Card Interior Glow */}
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_center,var(--brand),transparent)] opacity-0 group-hover/card:opacity-10 transition-opacity duration-700 pointer-events-none" 
                 style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }} />

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 pointer-events-none" />

            <button
              onClick={() => { setMode('login'); setSuccess(''); setError(''); }}
              className="group/back hover:text-[var(--brand)] text-[var(--text-muted)] transition-all inline-flex items-center gap-2 font-bold text-[10px] tracking-[0.2em] uppercase mb-12"
            >
              <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center group-hover/back:border-[var(--brand)] transition-colors">
                <ArrowRight size={14} className="rotate-180 group-hover/back:-translate-x-0.5 transition-transform" />
              </div>
              {t('login.return_node').toUpperCase()}
            </button>

            <div className="mb-10" style={{ opacity: initSequence >= 1 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span className="text-[9px] font-black tracking-[0.25em] text-[var(--brand)] px-3 py-1 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20 uppercase mb-4 inline-block">Security Layer-G1</span>
              <h2 className="text-3xl xl:text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                {mode === 'login' ? t('login.authorize') : t('login.reset_password') || 'Reset Pass'}
              </h2>
              <div className="flex items-center gap-2.5 opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] animate-pulse" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  {mode === 'login' ? t('login.handshake') : t('login.enter_email_reset') || 'Enter email to reset'}
                </p>
              </div>
            </div>

            {success && (
              <div className="bg-[var(--brand-dim)] border border-[var(--brand)]/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-[var(--brand)] font-medium text-[13px] animate-in fade-in zoom-in-95 duration-500">
                <Cpu size={18} className="flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-rose-500 font-medium text-[13px] animate-in fade-in zoom-in-95 duration-500">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" style={{ opacity: initSequence >= 2 ? 1 : 0, transition: 'all 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">{t('login.alias')}</label>
                <div className="relative group/field">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/field:text-[var(--brand)] transition-colors" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ista.ma" required
                    className="w-full rounded-xl py-4 pl-12 pr-4 outline-none transition-all bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-dim)] text-[14px] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">{t('login.passkey')}</label>
                  <div className="relative group/field">
                    <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within/field:text-[var(--brand)] transition-colors" />
                    <input
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" required
                      className="w-full rounded-xl py-4 pl-12 pr-4 outline-none transition-all bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-dim)] text-[14px] text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors uppercase tracking-widest">
                      {t('login.forgot_password') || 'Forgot Password?'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="bg-[var(--brand)] text-white font-black text-[12px] tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-[var(--brand-glow)] hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 relative overflow-hidden group"
                style={{ opacity: initSequence >= 4 ? 1 : 0 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                {loading
                  ? <><Loader2 size={18} className="animate-spin" /> {(mode === 'login' ? t('login.syncing') : t('login.sending')).toUpperCase()}</>
                  : <>{(mode === 'login' ? t('login.secure_auth') : t('login.send_link')).toUpperCase()} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}