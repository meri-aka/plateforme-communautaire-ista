import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  Home, Search, Bell, User, PackageSearch, LogOut,
  Menu, X, MessageSquare, MessageCircle, ChevronRight,
  ChevronLeft, Sun, Moon, Zap, PanelLeftClose, PanelLeftOpen,
  PanelRightClose, PanelRightOpen, Sparkles, LayoutGrid,
  TrendingUp, Activity, ShieldCheck
} from 'lucide-react';
import api from '../../../api/axios';
import BrandLogo from '../../admin/common/BrandLogo';

const AnimatedCounter = ({ target, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
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

export default function UserLayout({ children }) {
  const { user, logout }       = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate               = useNavigate();

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightHidden,   setRightHidden]   = useState(false);
  const [notifCount,    setNotifCount]    = useState(0);
  const [msgCount,      setMsgCount]      = useState(0);
  const [search,        setSearch]        = useState('');
  const [isScrolled,    setIsScrolled]    = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    api.get('/notifications').then(res => {
      const data = res.data?.data ?? res.data ?? [];
      setNotifCount(data.filter(n => !n.is_read).length);
    }).catch(() => {});
    api.get('/messages').then(res => {
      const total = (res.data ?? []).reduce((sum, c) => sum + (c.unread ?? 0), 0);
      setMsgCount(total);
    }).catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItems = [
    { to: '/',              icon: Home,          label: 'Community Feed' },
    { to: '/lost-found',    icon: PackageSearch, label: 'Lost & Found'   },
    { to: '/messages',      icon: MessageCircle, label: 'Direct Inbox',   badge: msgCount   },
    { to: '/notifications', icon: Bell,          label: 'Activity Log',   badge: notifCount },
    { to: '/feedback',      icon: MessageSquare, label: 'Share Feedback' },
    { to: '/profile',       icon: User,          label: 'My Passport'    },
  ];

  const resolveAvatar = (u) => {
    if (!u?.avatar) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name ?? 'U')}&background=7BB342&color=fff&bold=true`;
    }
    if (!u.avatar.startsWith('http')) return `http://localhost:8000/storage/${u.avatar}`;
    return u.avatar;
  };
  const avatarUrl = resolveAvatar(user);

  /* ── column widths ── */
  const leftW  = leftCollapsed ? 88  : 280;
  const rightW = rightHidden   ? 0   : 320;
  const cols   = `${leftW}px 1fr ${rightW > 0 ? rightW + 'px' : ''}`;

  return (
    <div className="min-h-screen relative" style={{ 
      background: 'var(--bg-main)', 
      color: 'var(--text-primary)', 
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" 
    }}>
      
      {/* Dynamic Background elements */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[var(--brand)] blur-[150px] opacity-[0.05] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-[var(--accent-gold)] blur-[150px] opacity-[0.05] rounded-full pointer-events-none" />

      {/* ── MOBILE TOPBAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-[200] backdrop-blur-xl border-b border-[var(--glass-border)] bg-[rgba(var(--bg-card-rgb),0.8)]">
        <Link to="/" className="flex items-center gap-3 no-underline">
          <BrandLogo size={28} />
          <span className="font-black text-lg tracking-tighter text-[var(--text-primary)]">ISTA<span className="text-[var(--brand)]">Connect</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileOpen(v => !v)} className="text-[var(--text-primary)]">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="mx-auto flex gap-6 px-6 py-6 min-h-screen max-w-[1600px] relative z-10">
        
        {/* ══ LEFT SIDEBAR ══ */}
        <aside className={`sticky top-6 h-[calc(100vh-48px)] flex flex-col transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${leftCollapsed ? 'w-[88px]' : 'w-[280px]'}`}>
          <div className="flex-1 flex flex-col pro-glass rounded-[32px] border border-[var(--glass-border)] p-4 shadow-premium overflow-hidden relative">
            
            {/* Header / Brand */}
            <div className={`flex items-center mb-8 px-2 ${leftCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!leftCollapsed ? (
                <>
                  <Link to="/" className="flex items-center gap-3 no-underline group">
                    <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                      <BrandLogo size={32} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm tracking-tight text-[var(--text-primary)] leading-none">ISTAConnect</span>
                      <span className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-[0.2em] mt-1">Stagiaire Pro</span>
                    </div>
                  </Link>
                  <button onClick={() => setLeftCollapsed(true)} className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--brand)] hover:bg-[var(--brand-dim)] transition-all">
                    <PanelLeftClose size={18} />
                  </button>
                </>
              ) : (
                <button onClick={() => setLeftCollapsed(false)} className="flex items-center justify-center hover:scale-110 transition-transform">
                  <BrandLogo size={32} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto px-1 no-scrollbar">
              {navItems.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `group flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 relative no-underline ${
                    isActive 
                      ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-glow)] translate-x-2' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:translate-x-1'
                  }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center transition-colors ${leftCollapsed ? 'mx-auto' : ''}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  {!leftCollapsed && <span className="font-bold text-[13px] tracking-tight flex-1">{label}</span>}
                  {badge > 0 && (
                    <span className={`flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                      leftCollapsed 
                        ? 'absolute top-2 right-2 border-2 border-[var(--bg-card)] bg-rose-500 text-white min-w-[12px] h-3'
                        : 'bg-white/20 text-white'
                    }`}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Section / User Card */}
            <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
              {!leftCollapsed ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[rgba(var(--bg-card-rgb),0.5)] border border-[var(--glass-border)] group/card">
                    <div className="relative flex-shrink-0">
                      <img src={avatarUrl} className="w-10 h-10 rounded-xl object-cover border border-[var(--glass-border)] group-hover/card:scale-110 transition-transform" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[var(--text-primary)] truncate">{user?.name}</div>
                      <div className="text-[10px] font-bold text-[var(--brand)] uppercase tracking-wider truncate opacity-70">
                        {user?.filiere?.code ?? 'Student'}
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="p-2 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Sign out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                  <button onClick={toggleTheme} className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--brand)] transition-all">
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === 'dark' ? 'Light Atmosphere' : 'Dark Atmosphere'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group/avatar cursor-pointer" onClick={() => navigate('/profile')}>
                    <img src={avatarUrl} className="w-12 h-12 rounded-2xl object-cover border-2 border-[var(--glass-border)] group-hover/avatar:border-[var(--brand)] transition-all" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                  </div>
                  <button 
                    onClick={handleLogout}
                    style={{ background: 'rgba(244, 63, 94, 0.1)' }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl text-rose-500 hover:bg-rose-500/20 transition-all"
                    title="Sign out"
                  >
                    <LogOut size={20} />
                  </button>
                  <button onClick={toggleTheme} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--brand)] transition-all">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main className="flex-1 min-w-0 py-2">
          {children}
        </main>

        {/* ══ RIGHT SIDEBAR ══ */}
        {!rightHidden && (
          <aside className="sticky top-6 h-[calc(100vh-48px)] w-[320px] hidden xl:flex flex-col gap-6">
            
            {/* Intelligence Panel */}
            <div className="pro-glass rounded-[32px] border border-[var(--glass-border)] p-6 shadow-premium flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--brand-dim)] flex items-center justify-center text-[var(--brand)]">
                    <Activity size={18} />
                  </div>
                  <span className="font-black text-xs uppercase tracking-[0.2em]">Insights</span>
                </div>
                <button onClick={() => setRightHidden(true)} className="p-2 text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">
                  <PanelRightClose size={18} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User,        val: 1.2, suffix: 'k', label: 'Members',  color: 'var(--brand)' },
                  { icon: Zap,         val: 98,  suffix: '%', label: 'Uptime',   color: 'var(--accent-gold)' },
                  { icon: TrendingUp,  val: 450, suffix: '+', label: 'Stories',  color: '#8B5CF6' },
                  { icon: ShieldCheck, val: 12,  suffix: '',  label: 'Moderators',color: '#F43F5E' },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-[rgba(var(--bg-card-rgb),0.4)] border border-[var(--glass-border)] group/stat">
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon size={12} style={{ color: s.color }} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{s.label}</span>
                    </div>
                    <div className="text-xl font-black tracking-tighter text-[var(--text-primary)]">
                      <AnimatedCounter target={s.val} suffix={s.suffix} decimals={s.val % 1 !== 0 ? 1 : 0} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative group/search">
                <div className="absolute inset-y-0 left-4 flex items-center text-[var(--text-muted)] group-focus-within/search:text-[var(--brand)] transition-colors">
                  <Search size={16} />
                </div>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Global Search..."
                  className="w-full h-12 pl-12 pr-4 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand-dim)] transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Quick Links / Navigation */}
            <div className="pro-glass rounded-[32px] border border-[var(--glass-border)] p-6 shadow-premium flex flex-col gap-4">
              <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] px-1">Navigation</h3>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Explore Profile', to: '/profile',    icon: User },
                  { label: 'Community Hub',  to: '/',           icon: LayoutGrid },
                  { label: 'Support & Help', to: '/feedback',    icon: MessageSquare },
                ].map((l, i) => (
                  <Link key={i} to={l.to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all group no-underline">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--brand)] group-hover:text-[var(--brand)] transition-all">
                      <l.icon size={14} />
                    </div>
                    <span className="text-[13px] font-bold flex-1">{l.label}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto px-6 py-4 text-center">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                © 2026 ISTAConnect Elite
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-[9px] font-black text-[var(--text-muted)] hover:text-[var(--brand)] cursor-pointer uppercase transition-colors">Privacy</span>
                <span className="text-[9px] font-black text-[var(--text-muted)] hover:text-[var(--brand)] cursor-pointer uppercase transition-colors">Terms</span>
                <span className="text-[9px] font-black text-[var(--text-muted)] hover:text-[var(--brand)] cursor-pointer uppercase transition-colors">Contact</span>
              </div>
            </div>
          </aside>
        )}

        {/* Right sidebar re-open tab */}
        {rightHidden && (
          <button
            onClick={() => setRightHidden(false)}
            className="fixed top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--brand)] text-white shadow-xl shadow-[var(--brand-glow)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[100]"
          >
            <PanelRightOpen size={18} />
          </button>
        )}
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[199] bg-[rgba(var(--bg-main-rgb),0.8)] backdrop-blur-xl pt-20 px-6 pb-10 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 p-4 rounded-2xl transition-all no-underline ${
                  isActive ? 'bg-[var(--brand)] text-white shadow-lg' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <Icon size={20} />
                <span className="font-bold text-sm">{label}</span>
                {badge > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
              </NavLink>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-[var(--glass-border)] flex flex-col gap-4">
            <button onClick={toggleTheme} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] font-bold text-sm">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {theme === 'dark' ? 'Light Atmosphere' : 'Dark Atmosphere'}
            </button>
            <button onClick={handleLogout} className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-rose-500 text-white font-black text-sm shadow-lg shadow-rose-500/20">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
      `}</style>
    </div>
  );
}