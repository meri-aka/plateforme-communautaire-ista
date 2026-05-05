import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
  Home, Search, Bell, User, PackageSearch, LogOut,
  Menu, X, MessageSquare, MessageCircle, ChevronRight,
  Sun, Moon, Zap
} from 'lucide-react';
import api from '../../../api/axios';
import BrandLogo from '../../admin/common/BrandLogo';

export default function UserLayout({ children }) {
  const { user, logout }       = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate               = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount]     = useState(0);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    api.get('/notifications').then(res => {
      const data = res.data?.data ?? res.data ?? [];
      setNotifCount(data.filter(n => !n.is_read).length);
    }).catch(() => {});
    api.get('/messages').then(res => {
      const total = (res.data ?? []).reduce((sum, c) => sum + (c.unread ?? 0), 0);
      setMsgCount(total);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const navItems = [
    { to: '/',              icon: Home,          label: 'Feed'          },
    { to: '/lost-found',    icon: PackageSearch, label: 'Lost & Found'  },
    { to: '/messages',      icon: MessageCircle, label: 'Messages',      badge: msgCount   },
    { to: '/notifications', icon: Bell,          label: 'Notifications', badge: notifCount },
    { to: '/feedback',      icon: MessageSquare, label: 'Feedback'      },
    { to: '/profile',       icon: User,          label: 'Profile'       },
  ];

  const avatarUrl = user?.avatar
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=7BB342&color=fff&bold=true`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── MOBILE TOPBAR ── */}
      <header className="mobile-topbar" style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: '56px', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrandLogo size={26} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={() => setMobileOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div className="layout-grid" style={{
        maxWidth: '1300px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '240px 1fr 280px',
        minHeight: '100vh',
      }}>

        {/* ══ LEFT SIDEBAR ══ */}
        <aside style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          padding: '20px 12px',
          borderRight: '1px solid var(--border-subtle)',
          background: 'var(--bg-card)',
        }}>
          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: '8px 10px', borderRadius: '12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--brand), #5a9e1a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px var(--brand-glow)',
            }}>
              <BrandLogo size={20} />
            </div>
            <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
              ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px',
                  textDecoration: 'none', fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--brand-dim)' : 'transparent',
                  transition: 'all 0.15s',
                  position: 'relative',
                })}
                onMouseEnter={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                  <span style={{
                    background: '#F43F5E', color: '#fff',
                    fontSize: '10px', fontWeight: 800, borderRadius: '999px',
                    minWidth: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                  }}>{badge > 9 ? '9+' : badge}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', border: 'none',
            background: 'var(--bg-card-hover)', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
            marginBottom: '8px', transition: 'all 0.15s', width: '100%',
          }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User card */}
          <div style={{
            padding: '10px', borderRadius: '12px',
            background: 'var(--bg-card-hover)',
            border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={avatarUrl} alt="avatar"
                style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover', display: 'block' }} />
              <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-card-hover)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'User'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.filiere?.name ?? user?.role ?? 'ISTA'}
              </div>
            </div>
            <button onClick={handleLogout} title="Sign out" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s', flexShrink: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#F43F5E'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={14} />
            </button>
          </div>
        </aside>

        {/* ══ MAIN CONTENT ══ */}
        <main style={{ minHeight: '100vh', borderRight: '1px solid var(--border-subtle)', padding: '24px 24px' }}>
          {children}
        </main>

        {/* ══ RIGHT SIDEBAR ══ */}
        <aside style={{
          position: 'sticky', top: 0, height: '100vh',
          padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          overflowY: 'auto',
          background: 'var(--bg-card)',
        }}>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)',
            borderRadius: '10px', padding: '9px 12px',
            transition: 'border-color 0.15s',
          }}
            onFocus={() => {}}
          >
            <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ISTAConnect..."
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', flex: 1, fontFamily: 'inherit' }}
            />
          </div>

          {/* Who to follow / Online users widget */}
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Zap size={13} color="var(--brand)" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Community</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { val: '1.2k', label: 'Students' },
                { val: '45',   label: 'Teachers'  },
                { val: '12',   label: 'Programs'  },
                { val: '98%',  label: 'Active'    },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg-card)', borderRadius: '8px', padding: '8px 10px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--brand)', letterSpacing: '-0.5px' }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: 'var(--bg-card-hover)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Quick Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {[
                { label: 'My Profile',     to: '/profile',       icon: User          },
                { label: 'Messages',       to: '/messages',      icon: MessageCircle },
                { label: 'Lost & Found',   to: '/lost-found',    icon: PackageSearch },
                { label: 'Notifications',  to: '/notifications', icon: Bell          },
                { label: 'Feedback',       to: '/feedback',      icon: MessageSquare },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '8px 9px', borderRadius: '8px', textDecoration: 'none',
                  color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
                  transition: 'all 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={13} strokeWidth={1.8} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <ChevronRight size={11} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 2 }}>
              © 2025 ISTAConnect<br />
              <span style={{ cursor: 'pointer' }}>Privacy</span> · <span style={{ cursor: 'pointer' }}>Terms</span> · <span style={{ cursor: 'pointer' }}>Contact</span>
            </div>
          </div>
        </aside>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '56px', left: 0, right: 0, bottom: 0, zIndex: 199,
          background: 'var(--bg-card)', padding: '12px',
          borderTop: '1px solid var(--border-subtle)', overflowY: 'auto',
        }}>
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                background: isActive ? 'var(--brand-dim)' : 'transparent',
                marginBottom: '2px',
              })}
            >
              <Icon size={18} />
              {label}
              {badge > 0 && (
                <span style={{ marginLeft: 'auto', background: '#F43F5E', color: '#fff', fontSize: '10px', fontWeight: 800, borderRadius: '999px', padding: '2px 7px' }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '10px', paddingTop: '10px', display: 'flex', gap: '8px' }}>
            <button onClick={toggleTheme} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card-hover)', cursor: 'pointer',
              fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600,
            }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button onClick={handleLogout} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '12px', borderRadius: '10px', border: 'none',
              background: 'rgba(244,63,94,0.08)', cursor: 'pointer',
              fontSize: '13px', color: '#F43F5E', fontWeight: 700,
            }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          .layout-grid { grid-template-columns: 220px 1fr !important; }
          .layout-grid aside:last-child { display: none !important; }
        }
        @media (max-width: 768px) {
          .layout-grid { grid-template-columns: 1fr !important; }
          .layout-grid aside:first-child { display: none !important; }
          .layout-grid main { padding: 76px 16px 24px !important; border-right: none !important; }
          .mobile-topbar { display: flex !important; }
        }
        aside::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}