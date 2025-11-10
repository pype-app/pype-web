'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Primeiro, verificar localStorage
    const stored = localStorage.getItem('pype-theme') as Theme;
    
    let initialTheme: Theme;
    if (stored && (stored === 'light' || stored === 'dark')) {
      // If exists in localStorage, use that value
      initialTheme = stored;
    } else {
      // Se não tem no localStorage, verificar preferência do sistema
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = systemPrefersDark ? 'dark' : 'light';
    }
    
    // Aplicar tema imediatamente no DOM
    const root = document.documentElement;
    root.classList.remove('dark', 'light'); // Remove both classes first
    if (initialTheme === 'dark') {
      root.classList.add('dark');
    }
    
    setTheme(initialTheme);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // Aplicar tema ao document
    const root = document.documentElement;
    root.classList.remove('dark', 'light'); // Limpar classes primeiro
    
    if (theme === 'dark') {
      root.classList.add('dark');
    }

    // Save to localStorage
    localStorage.setItem('pype-theme', theme);
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}