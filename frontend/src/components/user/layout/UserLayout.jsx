import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  Home, Search, Bell, User, PackageSearch, LogOut,
  Menu, X, MessageSquare, MessageCircle, Settings, ChevronRight
} from 'lucide-react';
import api from '../../../api/axios';
import BrandLogo from '../../admin/common/BrandLogo';

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);

  useEffect(() => {
    // Notifications unread count
    api.get('/notifications').then(res => {
      const data = res.data?.data ?? res.data ?? [];
      setNotifCount(data.filter(n => !n.is_read).length);
    }).catch(() => {});

    // Messages unread count
    api.get('/messages').then(res => {
      const total = (res.data ?? []).reduce((sum, c) => sum + (c.unread ?? 0), 0);
      setMsgCount(total);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/',              icon: Home,           label: 'Feed'          },
    { to: '/lost-found',    icon: PackageSearch,   label: 'Lost & Found'  },
    { to: '/messages',      icon: MessageCircle,   label: 'Messages',     badge: msgCount },
    { to: '/notifications', icon: Bell,            label: 'Notifications', badge: notifCount },
    { to: '/feedback',      icon: MessageSquare,   label: 'Feedback'      },
    { to: '/profile',       icon: User,            label: 'Profile'       },
  ];

  const avatarUrl = user?.avatar
    ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=7BB342&color=fff&bold=true`;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      color: 'var(--text-primary)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── MOBILE TOPBAR ── */}
      <header style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: '60px', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(20px)',
      }} className="mobile-topbar">
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrandLogo size={28} />
          <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary)' }}>
            ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
          </span>
        </Link>
        <button onClick={() => setMobileOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px' }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── 3-COLUMN LAYOUT ── */}
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '260px 1fr 300px',
        gap: '0', minHeight: '100vh', padding: '0',
      }} className="layout-grid">

        {/* LEFT SIDEBAR */}
        <aside style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', flexDirection: 'column',
          padding: '24px 16px',
          borderRight: '1px solid var(--border-subtle)',
        }}>
          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', padding: '0 8px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
              background: 'rgba(123,179,66,0.12)', border: '1px solid rgba(123,179,66,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BrandLogo size={24} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
              ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '12px',
                  textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(123,179,66,0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(123,179,66,0.15)' : '1px solid transparent',
                  transition: 'all 0.15s', position: 'relative',
                })}
                onMouseEnter={e => { if (!e.currentTarget.style.background.includes('123')) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { if (!e.currentTarget.style.background.includes('123')) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && (
                  <span style={{
                    background: '#F43F5E', color: '#fff',
                    fontSize: '10px', fontWeight: 800, borderRadius: '999px',
                    minWidth: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px',
                  }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Card */}
          <div style={{
            marginTop: 'auto', padding: '12px', borderRadius: '14px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <img src={avatarUrl} alt="avatar"
              style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button onClick={handleLogout} title="Sign out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'color 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#F43F5E'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{
          minHeight: '100vh',
          borderRight: '1px solid var(--border-subtle)',
          padding: '24px 28px',
        }}>
          {children}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside style={{
          position: 'sticky', top: 0, height: '100vh',
          padding: '24px 16px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          overflowY: 'auto',
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '12px', padding: '10px 14px',
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input placeholder="Rechercher..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: '13px', color: 'var(--text-primary)', flex: 1, fontFamily: 'inherit',
              }} />
          </div>

          {/* Community Stats */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', padding: '16px', overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(123,179,66,0.08)', pointerEvents: 'none' }} />
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>
              Communauté
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { val: '1.2k', label: 'Étudiants' },
                { val: '45',   label: 'Formateurs' },
                { val: '12',   label: 'Filières' },
                { val: '98%',  label: 'Actifs' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'var(--bg-main)', borderRadius: '10px', padding: '10px 12px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--brand)', letterSpacing: '-0.5px' }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: '16px', padding: '16px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              Accès Rapide
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { label: 'Mon Profil',    to: '/profile',       icon: User          },
                { label: 'Messages',      to: '/messages',      icon: MessageCircle },
                { label: 'Objets Perdus', to: '/lost-found',    icon: PackageSearch },
                { label: 'Notifications', to: '/notifications', icon: Bell          },
                { label: 'Feedback',      to: '/feedback',      icon: MessageSquare },
              ].map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '10px', textDecoration: 'none',
                  color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={14} strokeWidth={1.8} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <ChevronRight size={12} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              © 2025 ISTAConnect · <span style={{ cursor: 'pointer' }}>Confidentialité</span> · <span style={{ cursor: 'pointer' }}>Conditions</span>
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, zIndex: 199,
          background: 'var(--bg-card)', padding: '16px',
          borderTop: '1px solid var(--border-subtle)', overflowY: 'auto',
        }} className="mobile-drawer">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} end={to === '/'}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px', borderRadius: '12px',
                textDecoration: 'none', fontSize: '15px', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(123,179,66,0.08)' : 'transparent',
                marginBottom: '4px', position: 'relative',
              })}
            >
              <Icon size={20} />
              {label}
              {badge > 0 && (
                <span style={{
                  marginLeft: 'auto', background: '#F43F5E', color: '#fff',
                  fontSize: '11px', fontWeight: 800, borderRadius: '999px', padding: '2px 8px',
                }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px' }}>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
              padding: '14px 16px', borderRadius: '12px', border: 'none',
              background: 'rgba(244,63,94,0.06)', cursor: 'pointer',
              fontSize: '15px', color: '#F43F5E', fontWeight: 600, textAlign: 'left',
            }}>
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .layout-grid { grid-template-columns: 220px 1fr !important; }
          .layout-grid aside:last-child { display: none !important; }
        }
        @media (max-width: 768px) {
          .layout-grid { grid-template-columns: 1fr !important; }
          .layout-grid aside:first-child { display: none !important; }
          .layout-grid main { padding: 80px 16px 24px !important; border-right: none !important; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}