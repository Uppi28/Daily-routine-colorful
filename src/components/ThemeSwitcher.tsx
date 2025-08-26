import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeSwitcher.css';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className={`theme-switcher ${theme}`} 
      onClick={toggleTheme}
      title={`Switch to ${theme === 'colorful' ? 'minimalistic' : 'colorful'} theme`}
    >
      <div className="theme-icon">
        {theme === 'colorful' ? '🎨' : '⚪'}
      </div>
      <span className="theme-label">
        {theme === 'colorful' ? 'Colorful' : 'Minimal'}
      </span>
    </button>
  );
}
