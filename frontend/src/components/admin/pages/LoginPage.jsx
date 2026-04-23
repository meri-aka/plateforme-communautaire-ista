import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { Mail, AlertCircle, ArrowRight, Loader2, KeyRound, Globe, Cpu, Sun, Moon } from 'lucide-react';
import bgImage from '../../../assets/login-bg-pro.png';
import bgImageLight from '../../../assets/login-bg-prolight.png';
import BrandLogo from '../common/BrandLogo';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initSequence, setInitSequence] = useState(0);

  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  useEffect(() => {
    if (showForm) {
      const timers = [
        setTimeout(() => setInitSequence(1), 100),
        setTimeout(() => setInitSequence(2), 300),
        setTimeout(() => setInitSequence(3), 500),
        setTimeout(() => setInitSequence(4), 700),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [showForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(t('login.error_mismatch'));
    } finally {
      setLoading(false);
    }
  };

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className="transition-all hover:scale-105 active:scale-95"
      style={{
        position: 'absolute', top: '32px', right: '140px', zIndex: 100,
        width: '44px', height: '44px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '12px', cursor: 'pointer',
        background: theme === 'dark' ? 'rgba(123, 179, 66, 0.15)' : 'rgba(74, 124, 35, 0.1)',
        border: `1px solid ${theme === 'dark' ? 'rgba(123, 179, 66, 0.3)' : 'rgba(74, 124, 35, 0.3)'}`,
        color: 'var(--brand)',
        boxShadow: theme === 'dark' ? '0 0 20px rgba(123, 179, 66, 0.15)' : '0 4px 12px rgba(74, 124, 35, 0.15)',
      }}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-[#7BB342] drop-shadow-[0_0_8px_rgba(123,179,66,0.8)]" />
      ) : (
        <Moon size={20} className="text-[#4A7C23] drop-shadow-[0_0_8px_rgba(74,124,35,0.8)]" />
      )}
    </button>
  );

  const LanguageToggle = () => (
    <button
      onClick={toggleLanguage}
      className="pro-glass transition-all hover:scale-105 active:scale-95"
      style={{
        position: 'absolute', top: '32px', right: '32px', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px',
        borderRadius: '16px', border: '1px solid var(--glass-border)',
        color: theme === 'dark' ? '#fff' : '#1F2937', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      }}
    >
      <Globe size={18} color="var(--brand)" />
      {i18n.language.toUpperCase()}
    </button>
  );

  if (!showForm) {
    const currentBg = theme === 'dark' ? bgImage : bgImageLight;
    const overlayColor = theme === 'dark' ? 'rgba(4,6,14,0.3), rgba(4,6,14,0.9)' : 'rgba(255,255,255,0.1), rgba(255,255,255,0.85)';
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(${overlayColor}), url(${currentBg})`,
        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div className="mesh-bg" />
        <ThemeToggle />
        <LanguageToggle />

        <div className="animate-fade-in" style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '16px', zIndex: 100 }}>
          <BrandLogo size={42} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: theme === 'dark' ? '#fff' : '#1F2937', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.1 }}>
              ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand)', boxShadow: '0 0 10px var(--brand)' }} />
              <p style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>{t('login.terminal_live')}</p>
            </div>
          </div>
        </div>

        <div className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '850px', padding: '0 24px', position: 'relative', zIndex: 10 }}>
          <div style={{
            width: '120px', height: '120px', margin: '0 auto 48px', borderRadius: '32px',
            background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.5)', backdropFilter: 'blur(40px)',
            position: 'relative', overflow: 'hidden'
          }}>
            <Cpu size={52} color="var(--brand)" style={{ opacity: 0.5 }} />
            <div style={{ position: 'absolute', inset: '-4px', borderRadius: '32px', border: '2px solid var(--brand)', opacity: 0.2, animation: 'pulse-ring 4s ease-out infinite' }} />
          </div>

          <p style={{ fontSize: '11px', fontWeight: 900, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.6em', marginBottom: '20px' }}>{t('login.node_access')}</p>
          <h1 style={{ fontSize: '92px', fontWeight: 900, color: theme === 'dark' ? '#fff' : '#1F2937', letterSpacing: '-5px', margin: '0 0 28px', lineHeight: 0.85 }}>
            ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
          </h1>
          <p style={{ fontSize: '22px', color: 'var(--text-secondary)', margin: '0 0 64px', lineHeight: 1.5, fontWeight: 400, maxWidth: '680px', marginInline: 'auto' }}>
            {t('login.hero_title')} <br /> {t('login.hero_subtitle')}
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="pro-glass transition-all hover:scale-105 active:scale-95"
            style={{
              padding: '24px 72px', borderRadius: '24px', fontSize: '20px', fontWeight: 900,
              color: theme === 'dark' ? '#fff' : '#1F2937', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '20px',
              border: '1px solid var(--brand)', background: 'rgba(123, 179, 66, 0.1)',
              boxShadow: '0 25px 60px -15px var(--brand-glow)'
            }}
          >
            {t('login.init_ops').toUpperCase()} <ArrowRight size={22} />
          </button>
        </div>
      </div>
    );
  }

  const visualBg = theme === 'dark' ? bgImage : bgImageLight;
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', overflow: 'hidden' }}>
      <ThemeToggle />
      <LanguageToggle />
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.4; } 70% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }
      `}</style>

      {/* Visual Side */}
      <div className="animate-fade-in hidden lg:flex flex-[1.5] relative items-end p-24 overflow-hidden"
        style={{ background: `url(${visualBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: theme === 'dark' ? 'linear-gradient(135deg, rgba(4,6,14,0.1) 0%, rgba(4,6,14,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.85) 100%)' }} />
        <div className="mesh-bg absolute inset-0" />
        <div style={{ position: 'relative', maxWidth: '600px' }}>
          <h2 style={{ fontSize: '64px', fontStyle: 'italic', fontWeight: 900, color: theme === 'dark' ? '#fff' : '#1F2937', margin: '0 0 24px', lineHeight: 1, letterSpacing: '-4px' }}>
            {t('login.sidebar_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.6 }}>{t('login.sidebar_desc')}</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-24 bg-[var(--bg-main)] relative z-10 border-l border-[var(--glass-border)] shadow-2xl">
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <button
            onClick={() => setShowForm(false)}
            className="hover:text-[var(--brand)] transition-colors inline-flex items-center gap-2 font-bold mb-16"
          >
            <ArrowRight size={20} className="rotate-180" /> {t('login.return_node').toUpperCase()}
          </button>

          <div className="mb-14" style={{ opacity: initSequence >= 1 ? 1 : 0, transition: 'all 0.8s' }}>
            <span className="text-[10px] font-black tracking-widest text-[var(--brand)] px-3 py-1.5 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20 uppercase mb-4 inline-block">Security Layer-G1</span>
            <h2 className="text-5xl font-black text-[var(--text-primary)] mb-4 tracking-tighter">{t('login.authorize')}</h2>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--brand)] shadow-[0_0_10px_var(--brand)]" />
              <p className="text-lg text-[var(--text-secondary)] font-medium">{t('login.handshake')}</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 mb-10 flex items-center gap-4 text-rose-400 font-mono text-sm animate-fade-in">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8" style={{ opacity: initSequence >= 2 ? 1 : 0, transition: 'all 0.8s' }}>
            <div className="relative">
              <label className="absolute -top-3 left-4 bg-[var(--bg-main)] px-2 text-[10px] font-black text-[var(--brand)] uppercase tracking-widest z-10">{t('login.alias')}</label>
              <div className="relative">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ista.ma" required
                  className="w-full rounded-2xl py-5 pl-14 pr-6 outline-none transition-all"
                  style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="relative">
              <label className="absolute -top-3 left-4 bg-[var(--bg-main)] px-2 text-[10px] font-black text-[var(--brand)] uppercase tracking-widest z-10">{t('login.passkey')}</label>
              <div className="relative">
                <KeyRound size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" required
                  className="w-full rounded-2xl py-5 pl-14 pr-6 outline-none transition-all"
                  style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="bg-[var(--brand)] text-white font-black text-lg h-16 rounded-2xl shadow-2xl shadow-[var(--brand-glow)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3"
              style={{ opacity: initSequence >= 4 ? 1 : 0 }}
            >
              {loading
                ? <><Loader2 size={24} className="animate-spin" /> {t('login.syncing').toUpperCase()}</>
                : t('login.secure_auth').toUpperCase()
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}