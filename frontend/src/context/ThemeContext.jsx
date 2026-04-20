import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const TOKENS = {
  dark: {
    bg:    '#04060E',
    card:  '#080C18',
    cardH: '#0B1020',
    b0:    'rgba(255,255,255,0.055)',
    b1:    'rgba(255,255,255,0.11)',
    div:   'rgba(255,255,255,0.04)',
    t1:    '#EFF4FF',
    t2:    '#8899B4',
    t3:    '#3D4F6A',
    t4:    '#1A2233',
    green: '#10B981', greenBg: 'rgba(16,185,129,0.10)',
    amber: '#F59E0B', amberBg: 'rgba(245,158,11,0.10)',
    rose:  '#F43F5E', roseBg:  'rgba(244,63,94,0.10)',
    blue:  '#3B82F6', blueBg:  'rgba(59,130,246,0.10)',
    purple:'#8B5CF6', purpleBg:'rgba(139,92,246,0.10)',
  },
  light: {
    bg:    '#F8FAFC',
    card:  '#FFFFFF',
    cardH: '#F1F5F9',
    b0:    'rgba(0,0,0,0.05)',
    b1:    'rgba(0,0,0,0.1)',
    div:   'rgba(0,0,0,0.04)',
    t1:    '#0F172A',
    t2:    '#475569',
    t3:    '#94A3B8',
    t4:    '#E2E8F0',
    green: '#059669', greenBg: 'rgba(16,185,129,0.15)',
    amber: '#D97706', amberBg: 'rgba(245,158,11,0.15)',
    rose:  '#E11D48', roseBg:  'rgba(244,63,94,0.15)',
    blue:  '#2563EB', blueBg:  'rgba(59,130,246,0.15)',
    purple:'#7C3AED', purpleBg:'rgba(139,92,246,0.15)',
  }
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.style.backgroundColor = TOKENS[theme].bg;
    document.body.style.color = TOKENS[theme].t1;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const currentTokens = TOKENS[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, T: currentTokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
