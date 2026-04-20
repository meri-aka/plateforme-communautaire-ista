import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_COLORS = {
  dark: {
    bgMain: '#0F1117',
    bgCard: '#161A23',
    bgCardHover: '#1C212D',
    bgElevated: '#1A1F29',
    textPrimary: '#F4F5F7',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    brand: '#84CC27',
    brandDim: 'rgba(132, 204, 39, 0.15)',
    brandGlow: 'rgba(132, 204, 39, 0.25)',
    borderSubtle: 'rgba(255, 255, 255, 0.06)',
    borderActive: 'rgba(255, 255, 255, 0.12)',
  },
  light: {
    bgMain: '#EEF1F5',
    bgCard: '#FFFFFF',
    bgCardHover: '#F5F7FA',
    bgElevated: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    brand: '#4A7C23',
    brandDim: 'rgba(74, 124, 35, 0.12)',
    brandGlow: 'rgba(74, 124, 35, 0.15)',
    borderSubtle: 'rgba(0, 0, 0, 0.06)',
    borderActive: 'rgba(0, 0, 0, 0.12)',
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const colors = THEME_COLORS[theme];
    
    root.style.setProperty('--bg-main', colors.bgMain);
    root.style.setProperty('--bg-card', colors.bgCard);
    root.style.setProperty('--bg-card-hover', colors.bgCardHover);
    root.style.setProperty('--bg-elevated', colors.bgElevated);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--brand', colors.brand);
    root.style.setProperty('--brand-dim', colors.brandDim);
    root.style.setProperty('--brand-glow', colors.brandGlow);
    root.style.setProperty('--border-subtle', colors.borderSubtle);
    root.style.setProperty('--border-active', colors.borderActive);
    root.style.setProperty('--glass-bg', theme === 'dark' ? 'rgba(22, 26, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)');
    root.style.setProperty('--glass-border', colors.borderSubtle);
    
    root.setAttribute('data-theme', theme);
    document.body.style.background = colors.bgMain;
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);