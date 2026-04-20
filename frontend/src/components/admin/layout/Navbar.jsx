import { Bell, Calendar, Download, Search as SearchIcon, Menu, ChevronLeft, ChevronRight, Globe, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';

const T = {
  text1: 'var(--text-primary)',
  text2: 'var(--text-secondary)',
  text3: 'var(--text-muted)',
  border: 'var(--border-subtle)',
  brand: 'var(--brand)',
};

export default function Navbar({ title, subtitle, actions = [], onMenuClick, onCollapseToggle, isCollapsed }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="pro-glass" style={{
      position: 'sticky', top: 0, zIndex: 40, height: '60px',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px',
    }}>
      
      {/* ── Mobile Menu Toggle ── */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] transition-all"
        style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card-hover)' }}
      >
        <Menu size={20} />
      </button>

      {/* ── Desktop Collapse Toggle ── */}
      <button 
        onClick={onCollapseToggle}
        className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl text-[var(--text-secondary)] transition-all"
        style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-card-hover)' }}
        title={isCollapsed ? t('nav.expand') : t('nav.collapse')}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* ── Title & Breadcrumb ── */}
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

      {/* ── Search Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg-card-hover)', border: `1px solid ${T.border}`,
        padding: '8px 16px', borderRadius: '12px', flex: 1, maxWidth: '240px',
        transition: 'all 0.2s',
      }} className="hidden xl:flex">
        <SearchIcon size={15} color={T.text3} />
        <input 
          type="text" 
          placeholder={t('dashboard.search_placeholder') || 'Search...'} 
          style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: T.text1, width: '100%' }}
        />
      </div>

      {/* ── Actions & Switches ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="pro-glass pro-transition"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 800, color: T.text2,
            border: `1px solid ${T.border}`, cursor: 'pointer',
            background: 'var(--bg-card-hover)'
          }}
        >
          <Globe size={16} color="var(--brand)" />
          <span className="hidden xs:inline">{i18n.language.toUpperCase()}</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: T.border, margin: '0 4px' }} className="hidden xs:block" />

        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${T.border}`,
            cursor: 'pointer', transition: 'all 0.2s', color: T.text2
          }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-400" />}
        </button>

        {actions.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(btn.primary
                ? {
                    background: 'var(--brand)',
                    border: '1px solid var(--brand)',
                    color: '#fff',
                    boxShadow: '0 4px 12px var(--brand-glow)',
                  }
: {
                    background: 'var(--brand)',
                    border: '1px solid var(--brand)',
                    color: '#fff',
                    boxShadow: '0 4px 12px var(--brand-glow)',
                  }
                : {
                    background: 'var(--bg-card-hover)', 
                    border: `1px solid ${T.border}`,
                    color: T.text2,
                  }),
            }}
            className="hidden md:flex"
          >
            {btn.icon}
            <span className="hidden xl:inline">{btn.label}</span>
          </button>
        ))}

        <button
          style={{
            position: 'relative', width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-card-hover)', border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', color: T.text2
          }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#F43F5E', border: '2px solid var(--bg-main)',
          }} />
        </button>
      </div>
    </header>
  );
}