import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Users, FileText, Search,
  MessageSquare, Settings, Bell, FolderOpen, LogOut, ChevronRight, ChevronLeft
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import BrandLogo from '../common/BrandLogo';

const T_COLORS = {
  brand: 'var(--brand)',
  brandGlow: 'var(--brand-glow)',
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',
  border: 'var(--glass-border)',
  bg: 'var(--bg-main)',
  card: 'var(--bg-card)',
  bgElevated: 'var(--bg-elevated)',
};

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const nav = [
    {
      section: t('sections.analytics'),
      items: [
        { icon: LayoutDashboard, label: t('nav.overview'),    to: '/admin',           end: true },
        { icon: Users,           label: t('nav.users'),       to: '/admin/users',     badge: { n: '2.4K', color: 'brand' } },
        { icon: FileText,        label: t('nav.posts'),       to: '/admin/posts',     badge: { n: '14',   color: 'rose'  } },
        { icon: Users,           label: t('nav.groups'),      to: '/admin/groups' },
      ],
    },
    {
      section: t('sections.services'),
      items: [
        { icon: Search,        label: t('nav.lost_found'), to: '/admin/lost-found' },
        { icon: MessageSquare, label: t('nav.feedback'),   to: '/admin/feedback',  badge: { n: '18', color: 'rose' } },
      ],
    },
    {
      section: t('sections.system'),
      items: [
        { icon: Settings,   label: t('nav.settings'), to: '/admin/settings'      },
        { icon: Bell,       label: t('nav.dispatch'), to: '/admin/notifications' },
        { icon: FolderOpen, label: t('nav.logs'),     to: '/admin/logs'          },
      ],
    },
  ];

  return (
    <aside
      style={{
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        ${isCollapsed ? 'w-0 lg:w-[70px]' : 'w-[240px]'}`}
    >

      {/* ── Brand Header ── */}
      <div style={{
        padding: isCollapsed ? '24px 14px' : '32px 28px',
        display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between',
        transition: 'padding 0.3s',
        position: 'relative'
      }}>
        <div 
          onClick={() => isCollapsed && setIsCollapsed(false)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '16px', 
            cursor: isCollapsed ? 'pointer' : 'default' 
          }}
          title={isCollapsed ? t('nav.expand') : ''}
        >
          <div style={{
            width: isCollapsed ? '44px' : '52px',
            height: isCollapsed ? '44px' : '52px',
            borderRadius: '14px',
            background: 'var(--sidebar-accent-bg)',
            border: `1px solid ${T_COLORS.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden', position: 'relative',
            transition: 'all 0.3s'
          }}>
            <BrandLogo size={isCollapsed ? 32 : 42} />
            {!isCollapsed && (
              <div style={{ position: 'absolute', inset: 0, boxShadow: 'var(--sidebar-glow)' }} />
            )}
          </div>

          {!isCollapsed && (
            <div style={{ opacity: 1, transition: 'opacity 0.3s' }}>
              <h2 style={{
                fontSize: '18px', fontWeight: 900, color: T_COLORS.text1,
                letterSpacing: '-0.5px', margin: 0, lineHeight: 1.1
              }}>
                ISTA<span style={{ color: T_COLORS.brand }}>Connect</span>
              </h2>
              <p style={{
                fontSize: '10px', color: T_COLORS.text3, fontWeight: 900,
                letterSpacing: '0.15em', marginTop: '6px', textTransform: 'uppercase'
              }}>
                Mission Control
              </p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="lg:flex hidden items-center justify-center w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-brand transition-all border border-[var(--glass-border)]"
            style={{ background: 'var(--sidebar-accent-bg)' }}
            title={t('nav.collapse')}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex: 1, padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto'
      }}>
        {nav.map(({ section, items }) => (
          <div key={section}>
            {!isCollapsed && (
              <p style={{
                fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: T_COLORS.text3,
                paddingLeft: '12px', marginBottom: '14px',
              }}>
                {section}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map(({ icon: Icon, label, to, end, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setIsMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: isCollapsed ? '12px' : '12px 14px',
                    borderRadius: '12px',
                    fontSize: '14px', fontWeight: isActive ? 800 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    color: isActive ? T_COLORS.text1 : T_COLORS.text2,
                    background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--nav-active-border)' : 'transparent'}`,
                    boxShadow: isActive ? 'var(--nav-active-shadow)' : 'none',
                    justifyContent: isCollapsed ? 'center' : 'flex-start'
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '20px', height: '20px',
                        color: isActive ? T_COLORS.brand : T_COLORS.text3
                      }}>
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      {!isCollapsed && <span style={{ flex: 1 }}>{label}</span>}
                      {!isCollapsed && badge && (
                        <span style={{
                          fontSize: '10px', fontWeight: 900, padding: '2px 8px',
                          borderRadius: '8px',
                          background: badge.color === 'brand' ? 'var(--brand)' : 'rgba(244, 63, 94, 0.2)',
                          color: badge.color === 'brand' ? '#fff' : '#F43F5E',
                          boxShadow: badge.color === 'brand' ? '0 0 15px var(--brand-glow)' : 'none'
                        }}>
                          {badge.n}
                        </span>
                      )}
                      {!isCollapsed && isActive && (
                        <ChevronRight size={16} color={T_COLORS.brand} style={{ opacity: 0.8 }} />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer Section ── */}
      <div style={{ padding: '24px 14px', borderTop: `1px solid ${T_COLORS.border}`, background: 'var(--sidebar-footer-bg)' }}>
        <div className="pro-card" style={{
          display: 'flex', alignItems: 'center',
          gap: isCollapsed ? '0' : '14px',
          padding: isCollapsed ? '8px' : '14px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.03)',
          justifyContent: isCollapsed ? 'center' : 'flex-start'
        }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatar || 'https://i.pravatar.cc/100?img=68'}
              alt="avatar"
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                objectFit: 'cover', border: `1px solid ${T_COLORS.border}`
              }}
            />
          </div>
          {!isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '14px', fontWeight: 800, color: T_COLORS.text1,
                margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}>
                {user?.name || 'Administrator'}
              </p>
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontSize: '10px', color: '#F43F5E', fontWeight: 800, textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px'
                }}
              >
                <LogOut size={10} /> {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}