import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Sparkles, Users, Target, Bell, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const features = [
    { icon: Target, title: 'Lost & Found', desc: 'Quickly report and find lost items on campus' },
    { icon: Users, title: 'Community', desc: 'Connect with fellow students and staff' },
    { icon: Bell, title: 'Notifications', desc: 'Real-time alerts and updates' },
  ];

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative',
      background: 'var(--bg-main)'
    }}>
      {/* Mesh Background */}
      <div className="absolute inset-0 mesh-bg opacity-100" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(123, 179, 66, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 179, 66, 0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Theme Toggle Button */}
      <button
        onClick={handleToggleTheme}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 50,
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: theme === 'dark' ? 'rgba(123, 179, 66, 0.15)' : 'rgba(74, 124, 35, 0.1)',
          border: `1px solid ${theme === 'dark' ? 'rgba(123, 179, 66, 0.3)' : 'rgba(74, 124, 35, 0.3)'}`,
          color: 'var(--brand)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: theme === 'dark' ? '0 0 20px rgba(123, 179, 66, 0.15)' : '0 4px 12px rgba(74, 124, 35, 0.15)',
        }}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <Sun size={20} className="text-[#7BB342] drop-shadow-[0_0_8px_rgba(123,179,66,0.8)]" />
        ) : (
          <Moon size={20} className="text-[#4A7C23] drop-shadow-[0_0_8px_rgba(74,124,35,0.8)]" />
        )}
      </button>

      {/* Main Content */}
      <div 
        className="relative z-10 h-full flex flex-col items-center justify-center px-6"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Badge */}
        <div className="mb-6 px-4 py-2 rounded-full backdrop-blur-md border" style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <span className="flex items-center gap-2 text-xs font-semibold" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
            <Sparkles size={14} className="text-[var(--brand)]" />
            Campus Community Platform
          </span>
        </div>

        {/* Logo */}
        <div className="mb-8 animate-float">
          <img 
            src="/logo-pro-final.png" 
            alt="ISTA Platform" 
            className="h-20 md:h-28 w-auto"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(123, 179, 66, 0.3))' }}
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-4 tracking-tight" style={{ letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
          ISTA <span className="text-[var(--brand)]">Platform</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-center max-w-2xl mb-12 font-medium" style={{ color: 'var(--text-secondary)' }}>
          Your all-in-one campus community hub
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-10 py-5 bg-[#7BB342] hover:bg-[#7BB342]/90 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl hover:scale-105"
            style={{ boxShadow: '0 4px 20px rgba(123, 179, 66, 0.25)' }}
          >
            <span>Get Started</span>
            <ArrowRight size={22} />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {features.map((feat, i) => (
            <div 
              key={i}
              className="p-6 md:p-8 rounded-2xl backdrop-blur-xl border transition-all duration-500 cursor-pointer"
              style={{ 
                background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--brand)]/10 flex items-center justify-center mb-5">
                <feat.icon size={28} className="text-[var(--brand)]" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feat.title}</h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-4" style={{ background: theme === 'dark' ? 'linear-gradient(to top, rgba(4,6,14,0.9), transparent)' : 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }}>
        <div className="flex items-center gap-6" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
          <span className="text-xs font-semibold uppercase tracking-widest">ISTA</span>
          <span className="hidden md:block text-xs">© 2025 All rights reserved</span>
        </div>
      </div>
    </div>
  );
}