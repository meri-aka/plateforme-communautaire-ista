import { Bell, Calendar, Download, Search as SearchIcon, Menu, ChevronLeft, ChevronRight, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';

const T = {
  text1:  'var(--text-primary)',
  text2:  'var(--text-secondary)',
  text3:  'var(--text-muted)',
  border: 'var(--border-subtle)',
  brand:  'var(--brand)',
};

export default function Navbar({ title, subtitle, actions = [], onMenuClick, onCollapseToggle, isCollapsed }) {
  const { t, i18n }        = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifs, setNotifs]       = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const fetchNotifs = () => {
    setNotifsLoading(true);
    api.get('/notifications')
      .then(res => setNotifs(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setNotifsLoading(false));
  };

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`).catch(() => {});
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <header className="pro-glass" style={{
      position: 'sticky', top: 0, zIndex: 40, height: '60px',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
    }}>

      {/* Mobile Menu */}
      <button onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] transition-all"
        style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card-hover)' }}>
        <Menu size={20} />
      </button>

      {/* Desktop Collapse */}
      <button onClick={onCollapseToggle}
        className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] transition-all"
        style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card-hover)' }}
        title={isCollapsed ? t('nav.expand') : t('nav.collapse')}>
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }} className="hidden sm:block">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('nav.admin')}</span>
          <span style={{ fontSize: '11px', color: T.text3 }}>/</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: T.brand, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: T.text1, lineHeight: 1, margin: 0, letterSpacing: '-0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h1>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg-card-hover)', border: `1px solid ${T.border}`,
        padding: '8px 16px', borderRadius: '12px', flex: 1, maxWidth: '240px',
        transition: 'all 0.2s',
      }} className="hidden xl:flex">
        <SearchIcon size={15} color={T.text3} />
        <input type="text" placeholder={t('dashboard.search_placeholder') || 'Search...'}
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: T.text1, width: '100%' }} />
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>

        {/* Language */}
        <button onClick={toggleLanguage} className="pro-glass pro-transition"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 800, color: T.text2,
            border: `1px solid ${T.border}`, cursor: 'pointer',
            background: 'var(--bg-card-hover)'
          }}>
          <Globe size={16} color="var(--brand)" />
          <span className="hidden xs:inline">{i18n.language.toUpperCase()}</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: T.border, margin: '0 4px' }} className="hidden xs:block" />

        {/* Theme */}
        <button onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${T.border}`,
            cursor: 'pointer', transition: 'all 0.2s', color: T.text2
          }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark'
            ? <Sun size={18} className="text-amber-400" />
            : <Moon size={18} className="text-indigo-400" />}
        </button>

        {/* Page Actions */}
        {actions.map((btn, i) => (
          <button key={i} onClick={btn.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(btn.primary
                ? { background: 'var(--brand)', border: '1px solid var(--brand)', color: '#fff', boxShadow: '0 4px 12px var(--brand-glow)' }
                : { background: 'var(--bg-card-hover)', border: `1px solid ${T.border}`, color: T.text2 }),
            }}
            className="hidden md:flex">
            {btn.icon}
            <span className="hidden xl:inline">{btn.label}</span>
          </button>
        ))}

        {/* Notification Bell */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              const next = !showNotifications;
              setShowNotifications(next);
              if (next) fetchNotifs();
            }}
            style={{
              position: 'relative', width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--bg-card-hover)', border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', color: T.text2
            }}>
            <Bell size={18} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: '#F43F5E', border: '2px solid var(--bg-main)',
                fontSize: '9px', fontWeight: 900, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute', top: '48px', right: 0, zIndex: 100,
              width: '340px', background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)', borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)', overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Notifications</p>
                {unread > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--brand)', background: 'var(--brand-dim)', padding: '2px 8px', borderRadius: '20px' }}>
                    {unread} unread
                  </span>
                )}
              </div>

              {/* List */}
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifsLoading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
                ) : notifs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No notifications yet.</div>
                ) : notifs.slice(0, 8).map(n => (
                  <div key={n.id}
                    onClick={() => !n.is_read && markRead(n.id)}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: !n.is_read ? 'var(--brand-dim)' : 'transparent',
                      cursor: 'pointer',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <p style={{ fontSize: '13px', fontWeight: n.is_read ? 400 : 700, color: 'var(--text-primary)', margin: 0, flex: 1 }}>
                        {n.message ?? n.type}
                      </p>
                      {!n.is_read && (
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: '4px' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0', textTransform: 'capitalize' }}>
                      {n.type} • {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <a href="/admin/notifications"
                  style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)', textDecoration: 'none' }}>
                  View all notifications →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}