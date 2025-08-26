import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'colorful' | 'minimalistic';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to colorful
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'colorful';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    // Add theme class to body for global CSS variables
    document.body.className = `theme-${newTheme}`;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'colorful' ? 'minimalistic' : 'colorful';
    setTheme(newTheme);
  };

  useEffect(() => {
    // Apply theme on mount
    document.body.className = `theme-${theme}`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
