import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api/axios';
import {
  Mail, KeyRound, User, ArrowRight, Loader2,
  AlertCircle, Eye, EyeOff, Sparkles, Sun, Moon, Globe
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
  return (
    <button
      className="transition-all hover:scale-105 active:scale-95 z-[100] absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer font-bold text-[11px] uppercase tracking-wider backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--brand)]"
      style={{
        color: 'var(--text-primary)',
        background: 'rgba(var(--bg-elevated-rgb), 0.1)'
      }}
    >
      <Globe size={14} className="text-[var(--brand)]" /> EN
    </button>
  );
};

// ── Shared Input Field ────────────────────────────────────────────────────────
function Field({ label, icon: Icon, type='text', value, onChange, placeholder, error, rightEl }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex flex-col gap-1.5 group/field w-full">
      <div className="flex justify-between items-end px-1">
        <label className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${focused ? 'text-[var(--brand)] translate-x-1' : 'text-[var(--text-muted)]'}`}>
          {label}
        </label>
        {error && (
          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
            <AlertCircle size={10}/> {error}
          </span>
        )}
      </div>
      
      <div className="relative">
        <div className={`absolute -inset-0.5 rounded-[14px] opacity-0 transition-opacity duration-500 blur-md pointer-events-none ${focused ? 'opacity-20' : ''}`}
          style={{ background: 'var(--brand)' }}
        />
        
        <div className={`relative flex items-center transition-all duration-300 rounded-[12px] border ${
          focused 
            ? 'border-[var(--brand)] bg-[var(--bg-card)] shadow-[0_0_0_4px_var(--brand-dim)]' 
            : error 
              ? 'border-rose-500/50 bg-rose-500/[0.02]' 
              : 'border-[var(--border-subtle)] bg-[var(--bg-card-hover)] hover:border-[var(--border-active)]'
        }`}>
          <div className={`pl-4 transition-colors duration-300 ${focused ? 'text-[var(--brand)]' : 'text-[var(--text-muted)]'}`}>
            <Icon size={16} />
          </div>
          
          <input
            type={type} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder}
            onFocus={() => setFocused(true)} 
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent py-3.5 px-3 outline-none font-medium text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:font-normal"
            style={{ 
              paddingRight: rightEl ? '40px' : '16px'
            }}
          />
          {rightEl && <div className="absolute right-2 flex items-center">{rightEl}</div>}
        </div>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false);
  return (
    <Field
      label={label} icon={KeyRound} type={show ? 'text' : 'password'}
      value={value} onChange={onChange} placeholder={placeholder} error={error}
      rightEl={
        <button type="button" onClick={()=>setShow(v=>!v)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all">
          {show ? <EyeOff size={15}/> : <Eye size={15}/>}
        </button>
      }
    />
  );
}

// ── Redirect Helper ───────────────────────────────────────────────────────────
function redirectAfterAuth(user, navigate) {
  if (user.role === 'admin') return navigate('/admin', { replace: true });
  if (!user.filiere_id)      return navigate('/complete-profile', { replace: true });
  return navigate('/feed', { replace: true });
}

// ── Main Auth Page Component ──────────────────────────────────────────────────
export default function UserAuthPage() {
  const location = useLocation();
  const [mode, setMode] = useState(
    location.pathname === '/register' ? 'register' : 
    location.pathname === '/forgot-password' ? 'forgot' : 'login'
  );
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Animations & Interactive
  const [initSequence, setInitSequence] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Form State
  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const isLogin = mode === 'login';
  const isForgot = mode === 'forgot';

  useEffect(() => {
    if (!authLoading && user) redirectAfterAuth(user, navigate);
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setInitSequence(1), 100),
      setTimeout(() => setInitSequence(2), 250),
      setTimeout(() => setInitSequence(3), 400),
      setTimeout(() => setInitSequence(4), 550),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX - window.innerWidth / 2) / 40;
    const y = (clientY - window.innerHeight / 2) / 40;
    setMousePos({ x, y });
  };

  if (authLoading) return null;

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    
    if (!isLogin && !isForgot) {
      const errs = {};
      if (!form.name.trim()) errs.name = 'Full name is required.';
      if (!form.email.includes('@')) errs.email = 'Enter a valid email address.';
      if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
      if (form.password !== form.password_confirmation) errs.password_confirmation = 'Passwords do not match.';
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }

    if (isForgot) {
      if (!form.email.includes('@')) { setErrors({ email: 'Enter a valid email address.' }); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const u = await login(form.email, form.password);
        redirectAfterAuth(u, navigate);
      } else if (isForgot) {
        await new Promise(r => setTimeout(r, 1500));
        setSuccessMessage('A password reset link has been sent to your email.');
      } else {
        const res = await api.post('/register', { ...form, role: 'stagiaire' });
        localStorage.setItem('token', res.data.token);
        const u = await login(form.email, form.password);
        redirectAfterAuth(u, navigate);
      }
    } catch (err) {
      const data = err.response?.data;
      if (!isLogin && data?.errors) {
        const mapped = {};
        Object.entries(data.errors).forEach(([k,v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(mapped);
      } else {
        setGlobalError(data?.message ?? data?.error ?? (isLogin ? 'Invalid credentials.' : 'Registration failed.'));
      }
    }
    setLoading(false);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setGlobalError('');
    setErrors({});
    setSuccessMessage('');
    setForm({ name:'', email:'', password:'', password_confirmation:'' });
  };

  return (
    <div 
      className="h-screen bg-[var(--bg-main)] flex overflow-hidden font-['Inter'] relative"
      onMouseMove={handleMouseMove}
    >
      <ThemeToggle />
      <LanguageToggle />

      {/* Decorative Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Visual Side — h-screen via parent, never stretches */}
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
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-10 backdrop-blur-md border border-white/10 bg-white/5 shadow-2xl">
             <div className="w-2 h-2 rounded-full bg-[var(--brand)] animate-pulse" />
             <span className="text-[10px] font-black text-white/90 tracking-[0.2em] uppercase">The Digital Campus</span>
          </div>
          
          <h2 className="text-[48px] xl:text-[64px] font-black mb-8 leading-[0.95] tracking-tight text-white">
            Transforming <br/>
            <span className="text-[var(--brand)]">student life.</span>
          </h2>
          
          <p className="text-[16px] xl:text-[18px] leading-relaxed text-white/70 font-medium max-w-[420px]">
            The most powerful platform built for ISTA students. Collaborate, grow, and shape your future together.
          </p>
          
          <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-12">
            <div className="group/stat">
              <div className="text-2xl font-bold text-white tracking-tighter group-hover/stat:text-[var(--brand)] transition-colors">
                <AnimatedCounter key={mode} target={5} suffix="K+" />
              </div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Stagiaires</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="group/stat">
              <div className="text-2xl font-bold text-white tracking-tighter group-hover/stat:text-[var(--brand)] transition-colors">
                <AnimatedCounter key={mode} target={120} suffix="+" />
              </div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Clubs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side — overflow-y-auto so it scrolls internally, never pushes layout */}
      <div className="flex-1 lg:w-1/2 flex-none flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10 bg-[var(--bg-main)] overflow-y-auto">
        
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

            {/* Back to Landing */}
            <button
              onClick={() => navigate('/')}
              className="group/back hover:text-[var(--brand)] text-[var(--text-muted)] transition-all inline-flex items-center gap-2 font-bold text-[10px] tracking-[0.2em] uppercase mb-10"
            >
              <div className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center group-hover/back:border-[var(--brand)] transition-colors">
                <ArrowRight size={14} className="rotate-180 group-hover/back:-translate-x-0.5 transition-transform" />
              </div>
              Back to Home
            </button>

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1.5 rounded-2xl mb-10 bg-black/10 dark:bg-white/5 border border-white/5 shadow-inner" 
                 style={{ opacity: initSequence >= 1 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)', transform: initSequence >= 1 ? 'translateY(0)' : 'translateY(20px)' }}>
              {[
                { key:'login',    label:'Sign In'         },
                { key:'register', label:'Create Account'  },
              ].map(tab => (
                <button key={tab.key} onClick={() => switchMode(tab.key)}
                  className={`flex-1 py-3 rounded-xl font-bold text-[12px] transition-all duration-500 tracking-wide ${
                    mode === tab.key ? 'text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  style={{
                    background: mode === tab.key ? 'var(--brand)' : 'transparent',
                    boxShadow: mode === tab.key ? '0 10px 20px -5px var(--brand-glow)' : 'none',
                    opacity: isForgot ? 0.4 : 1,
                    pointerEvents: isForgot ? 'none' : 'auto'
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-10" style={{ opacity: initSequence >= 2 ? 1 : 0, transition: 'all 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1)', transform: initSequence >= 2 ? 'translateY(0)' : 'translateY(20px)' }}>
              <h2 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
                {isLogin ? 'Welcome back' : isForgot ? 'Password recovery' : 'Join the elite'}
              </h2>
              <p className="text-[14px] text-[var(--text-secondary)] font-medium leading-relaxed opacity-70">
                {isLogin ? 'Access your portal and stay connected.' : 
                 isForgot ? 'We\'ll help you get back into your account.' : 
                 'Begin your journey with the official ISTA platform.'}
              </p>
            </div>

            {successMessage && (
              <div className="bg-[var(--brand-dim)] border border-[var(--brand)]/30 rounded-2xl p-4 mb-8 flex items-start gap-3 text-[var(--brand)] text-sm font-medium animate-in fade-in zoom-in-95 duration-500">
                <Sparkles size={18} className="flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {globalError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3 text-rose-500 text-sm font-medium animate-in fade-in zoom-in-95 duration-500">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{globalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6" style={{ opacity: initSequence >= 3 ? 1 : 0, transition: 'all 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1)', transform: initSequence >= 3 ? 'translateY(0)' : 'translateY(20px)' }}>
              
              {!isLogin && !isForgot && (
                <Field label="Full Name" icon={User} value={form.name} onChange={setF('name')} placeholder="e.g. Adam Bennani" error={errors.name} />
              )}

              <Field label="Email Address" icon={Mail} type="email" value={form.email} onChange={setF('email')} placeholder="student@ista.ma" error={errors.email} />
              
              {!isForgot && (
                <>
                  <div className="space-y-3">
                    <PasswordField label="Password" value={form.password} onChange={setF('password')} placeholder="••••••••••••" error={errors.password} />
                    
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-2 cursor-pointer group/check">
                        <div className="relative w-4 h-4 rounded-md border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5 group-hover/check:border-[var(--brand)] transition-colors overflow-hidden">
                          <input type="checkbox" className="peer absolute inset-0 opacity-0 cursor-pointer" />
                          <div className="absolute inset-0 bg-[var(--brand)] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-2 h-2 rounded-sm bg-white" />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Remember me</span>
                      </label>

                      {isLogin && (
                        <button type="button" onClick={() => switchMode('forgot')} className="text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--brand)] transition-all uppercase tracking-[0.1em]">
                          Lost password?
                        </button>
                      )}
                    </div>
                  </div>

                  {!isLogin && (
                    <PasswordField label="Confirm Password" value={form.password_confirmation} onChange={setF('password_confirmation')} placeholder="Repeat password" error={errors.password_confirmation} />
                  )}
                </>
              )}

              <div className="pt-2" style={{ opacity: initSequence >= 4 ? 1 : 0, transition: 'all 0.8s 0.3s ease-out' }}>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-[var(--brand)] text-white font-black text-[12px] tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-[var(--brand-glow)] hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                  {loading
                    ? <><Loader2 size={18} className="animate-spin" /> WORKING...</>
                    : <>{isLogin ? 'SIGN IN' : isForgot ? 'SEND LINK' : 'GET STARTED'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  }
                </button>
              </div>
            </form>

            <div className="mt-12 text-center" style={{ opacity: initSequence >= 4 ? 1 : 0, transition: 'all 1s 0.4s' }}>
              <p className="text-[12px] font-medium text-[var(--text-muted)]">
                By continuing you agree to ISTA's <span className="text-[var(--brand)] cursor-pointer hover:underline font-bold">Terms of Service</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
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
    </div>
  );
}