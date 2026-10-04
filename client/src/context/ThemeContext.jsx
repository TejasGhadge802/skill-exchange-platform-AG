import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const THEMES = [
  { id: 'light', name: 'Light', color: '#FFFFFF', border: '#CBD5E1', dot: '#F1F5F9' },
  { id: 'dark', name: 'Dark', color: '#0F172A', border: '#334155', dot: '#1E293B' },
  { id: 'chocolate', name: 'Chocolate', color: '#4E342E', border: '#DDD2C5', dot: '#4E342E' },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved && ['light', 'dark', 'chocolate'].includes(saved)) {
      return saved;
    }
    if (saved === 'dark') return 'dark';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-cobalt', 'theme-chocolate');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'chocolate') {
      root.classList.add('theme-chocolate');
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
