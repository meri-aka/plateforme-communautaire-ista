import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../api/axios';
import {
  Mail, KeyRound, User, ArrowRight, Loader2,
  AlertCircle, Eye, EyeOff, Sparkles, Sun, Moon, Globe
} from 'lucide-react';
import bgImage from '../../../assets/login-bg-pro.png';
import bgImageLight from '../../../assets/login-bg-prolight.png';
import BrandLogo from '../../admin/common/BrandLogo';

// ── Theme & Lang Toggles ──────────────────────────────────────────────────────
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="transition-all hover:scale-105 active:scale-95 z-[100] absolute top-8 right-[140px] w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer"
      style={{
        background: theme === 'dark' ? 'rgba(123, 179, 66, 0.15)' : 'rgba(74, 124, 35, 0.1)',
        border: `1px solid ${theme === 'dark' ? 'rgba(123, 179, 66, 0.3)' : 'rgba(74, 124, 35, 0.3)'}`,
        boxShadow: theme === 'dark' ? '0 0 20px rgba(123, 179, 66, 0.15)' : '0 4px 12px rgba(74, 124, 35, 0.15)',
      }}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-[#7BB342]" />
      ) : (
        <Moon size={20} className="text-[#4A7C23]" />
      )}
    </button>
  );
};

const LanguageToggle = () => {
  const { theme } = useTheme();
  return (
    <button
      className="pro-glass transition-all hover:scale-105 active:scale-95 z-[100] absolute top-8 right-8 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl cursor-pointer font-extrabold text-[13px]"
      style={{
        border: '1px solid var(--glass-border)',
        color: theme === 'dark' ? '#fff' : '#1F2937',
        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      }}
    >
      <Globe size={18} color="var(--brand)" /> EN
    </button>
  );
};

// ── Shared Input Field ────────────────────────────────────────────────────────
function Field({ label, icon: Icon, type='text', value, onChange, placeholder, error, rightEl }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <label className="absolute -top-3 left-4 bg-[var(--bg-main)] px-2 text-[10px] font-black text-[var(--brand)] uppercase tracking-widest z-10">
        {label}
      </label>
      <div className="relative">
        <Icon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-200" style={{ color: focused ? 'var(--brand)' : 'var(--text-muted)' }} />
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full rounded-2xl py-4 pl-14 outline-none transition-all duration-300 font-medium"
          style={{ 
            background: 'var(--bg-card-hover)', 
            border: `1px solid ${focused ? 'var(--brand)' : error ? '#F43F5E' : 'var(--border-subtle)'}`, 
            color: 'var(--text-primary)',
            boxShadow: focused ? '0 0 0 4px var(--brand-dim)' : error ? '0 0 0 4px rgba(244,63,94,0.1)' : 'none',
            paddingRight: rightEl ? '48px' : '24px'
          }}
        />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      {error && (
        <p className="absolute -bottom-5 left-2 text-[11px] font-bold text-rose-500 flex items-center gap-1">
          <AlertCircle size={12}/> {error}
        </p>
      )}
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
          {show ? <EyeOff size={18}/> : <Eye size={18}/>}
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
  const [mode, setMode] = useState(location.pathname === '/register' ? 'register' : 'login');
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Animations
  const [initSequence, setInitSequence] = useState(0);

  // Form State
  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

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
  }, [mode]);

  if (authLoading) return null;

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    setErrors({});
    
    if (!isLogin) {
      const errs = {};
      if (!form.name.trim()) errs.name = 'Full name is required.';
      if (!form.email.includes('@')) errs.email = 'Enter a valid email address.';
      if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
      if (form.password !== form.password_confirmation) errs.password_confirmation = 'Passwords do not match.';
      if (Object.keys(errs).length) { setErrors(errs); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const u = await login(form.email, form.password);
        redirectAfterAuth(u, navigate);
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
    setInitSequence(0);
    setGlobalError('');
    setErrors({});
    setForm({ name:'', email:'', password:'', password_confirmation:'' });
  };

  const visualBg = theme === 'dark' ? bgImage : bgImageLight;

  // ── Form Screen ──
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex overflow-hidden">
      <ThemeToggle />
      <LanguageToggle />

      {/* Visual Side */}
      <div className="animate-fade-in hidden lg:flex flex-[1.2] relative items-end p-24 overflow-hidden"
        style={{ background: `url(${visualBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, rgba(4,6,14,0.2) 0%, rgba(4,6,14,0.98) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.95) 100%)' }} />
        <div className="mesh-bg absolute inset-0 opacity-50" />
        
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(123,179,66,0.15) 0%, transparent 70%)' }}/>
        <div className="absolute bottom-[20%] right-[-100px] w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)' }}/>

        <div className="relative z-10 max-w-[600px]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8" style={{ background: 'rgba(123,179,66,0.15)', border: '1px solid rgba(123,179,66,0.3)' }}>
             <Sparkles size={16} color="var(--brand)"/>
             <span className="text-[11px] font-black text-[var(--brand)] tracking-widest uppercase">Community First</span>
          </div>
          <h2 className="text-[56px] font-black mb-6 leading-[1.1] tracking-[-2px]" style={{ color: theme === 'dark' ? '#fff' : '#1F2937' }}>
            Where <span className="bg-gradient-to-r from-[var(--brand)] to-[#D4AF37] bg-clip-text text-transparent">talent</span><br/>meets opportunity.
          </h2>
          <p className="text-[var(--text-secondary)] text-[18px] leading-[1.6] max-w-[480px]">
            Join thousands of students and alumni. Share your projects, find study partners, and never miss an important campus update.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-20 bg-[var(--bg-main)] relative z-10 lg:border-l border-[var(--glass-border)]">
        <div className="w-full max-w-[440px]">

          {/* Back to Landing */}
          <button
            onClick={() => navigate('/')}
            className="hover:text-[var(--brand)] text-[var(--text-muted)] transition-colors inline-flex items-center gap-2 font-black text-[11px] tracking-widest uppercase mb-16"
          >
            <ArrowRight size={16} className="rotate-180" /> Back to Home
          </button>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1.5 rounded-2xl mb-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', opacity: initSequence >= 1 ? 1 : 0, transition: 'all 0.8s', transform: initSequence >= 1 ? 'translateY(0)' : 'translateY(10px)' }}>
            {[
              { key:'login',    label:'Sign In'         },
              { key:'register', label:'Create Account'  },
            ].map(tab => (
              <button key={tab.key} onClick={() => switchMode(tab.key)}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] transition-all duration-300"
                style={{
                  background: mode === tab.key ? 'linear-gradient(135deg, #7BB342 0%, #9bcf44 100%)' : 'transparent',
                  color: mode === tab.key ? '#fff' : 'var(--text-muted)',
                  boxShadow: mode === tab.key ? '0 8px 20px rgba(123,179,66,0.3)' : 'none',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mb-10" style={{ opacity: initSequence >= 2 ? 1 : 0, transition: 'all 0.8s', transform: initSequence >= 2 ? 'translateY(0)' : 'translateY(10px)' }}>
            <h2 className="text-4xl font-black text-[var(--text-primary)] mb-3 tracking-tight">
              {isLogin ? 'Welcome back.' : 'Join us.'}
            </h2>
            <p className="text-[var(--text-secondary)] font-medium">
              {isLogin ? 'Enter your credentials to access your portal.' : 'Create your account to start connecting.'}
            </p>
          </div>

          {globalError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-start gap-3 text-rose-500 text-sm font-medium animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-8" style={{ opacity: initSequence >= 3 ? 1 : 0, transition: 'all 0.8s', transform: initSequence >= 3 ? 'translateY(0)' : 'translateY(10px)' }}>
            
            {!isLogin && (
              <Field label="Full Name" icon={User} value={form.name} onChange={setF('name')} placeholder="Mohammed Alami" error={errors.name} />
            )}

            <Field label="Email Address" icon={Mail} type="email" value={form.email} onChange={setF('email')} placeholder="student@ista.ma" error={errors.email} />
            <PasswordField label="Password" value={form.password} onChange={setF('password')} placeholder="••••••••••••" error={errors.password} />
            
            {!isLogin && (
              <PasswordField label="Confirm Password" value={form.password_confirmation} onChange={setF('password_confirmation')} placeholder="Repeat password" error={errors.password_confirmation} />
            )}

            <div className="pt-2" style={{ opacity: initSequence >= 4 ? 1 : 0, transition: 'all 0.8s' }}>
              <button
                type="submit" disabled={loading}
                className="w-full bg-[var(--brand)] text-white font-black text-lg h-16 rounded-2xl shadow-2xl shadow-[var(--brand-glow)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {loading
                  ? <><Loader2 size={24} className="animate-spin" /> {isLogin ? 'AUTHENTICATING...' : 'CREATING...'}</>
                  : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'
                }
              </button>
            </div>
          </form>

          <div className="mt-12 text-center" style={{ opacity: initSequence >= 4 ? 1 : 0, transition: 'all 1s' }}>
            <p className="text-[12px] font-medium text-[var(--text-muted)]">
              By continuing you agree to ISTA's <span className="text-[var(--brand)] cursor-pointer hover:underline">Terms of Service</span>.
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}