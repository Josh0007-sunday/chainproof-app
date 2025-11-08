import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    primary: string;
    border: string;
    borderSecondary: string;
    cardBg: string;
    inputBg: string;
    success: string;
    error: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('chainproof-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('chainproof-theme', newTheme);
  };

  const colors = theme === 'dark' ? {
    background: '#0e0d13',
    backgroundSecondary: '#181824',
    backgroundTertiary: '#252538',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    textTertiary: '#6b7280',
    primary: '#35da9a',
    border: '#252538',
    borderSecondary: '#3a3a4a',
    cardBg: '#181824',
    inputBg: '#0e0d13',
    success: '#4ade80',
    error: '#ef4444',
    warning: '#fbbf24',
  } : {
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#e5e7eb',
    text: '#1f2937',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
    primary: '#10b981',
    border: '#e5e7eb',
    borderSecondary: '#d1d5db',
    cardBg: '#ffffff',
    inputBg: '#f9fafb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  };

  const value = {
    theme,
    toggleTheme,
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
