import React from 'react';
import { useApp } from '../context/AppContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import './Navigation.css';

interface NavigationProps {
  onSignOut: () => void;
  user: any;
}

export const Navigation: React.FC<NavigationProps> = ({ onSignOut, user }) => {
  const { state, dispatch } = useApp();

  const handleSectionChange = (section: any) => {
    dispatch({ type: 'SET_SECTION', payload: section });
  };

  const handleSignOut = () => {
    onSignOut();
  };



  return (
    <nav className="navigation">
      <div className="nav-header">
        <div className="header-content">
          <h1 className="title">Daily Routine Fun! 🎉</h1>
          <p className="subtitle">Organize your life with a smile!</p>
        </div>
        <div className="user-section">
          <ThemeSwitcher />
          <div className="user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.displayName || 'Friend'}</span>
          </div>
          <button className="sign-out-button" onClick={handleSignOut}>
            <span className="sign-out-icon">🚪</span>
            <span className="sign-out-text">Sign Out</span>
          </button>
        </div>
      </div>

      <div className="nav-buttons">
        <button
          className={`nav-button ${state.currentSection === 'todo' ? 'active' : ''}`}
          onClick={() => handleSectionChange('todo')}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">To-Do List</span>
          <div className="floating-character">🤖</div>
        </button>

        <button
          className={`nav-button ${state.currentSection === 'shopping' ? 'active' : ''}`}
          onClick={() => handleSectionChange('shopping')}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-text">Shopping</span>
          <div className="floating-character">🦄</div>
        </button>

        <button
          className={`nav-button ${state.currentSection === 'meals' ? 'active' : ''}`}
          onClick={() => handleSectionChange('meals')}
        >
          <span className="nav-icon">🍕</span>
          <span className="nav-text">Meal Planner</span>
          <div className="floating-character">🍕</div>
        </button>

        <button
          className={`nav-button ${state.currentSection === 'expenses' ? 'active' : ''}`}
          onClick={() => handleSectionChange('expenses')}
        >
          <span className="nav-icon">💰</span>
          <span className="nav-text">Expenses</span>
          <div className="floating-character">🐷</div>
        </button>

        <button
          className={`nav-button ${state.currentSection === 'diary' ? 'active' : ''}`}
          onClick={() => handleSectionChange('diary')}
        >
          <span className="nav-icon">🦋</span>
          <span className="nav-text">Diary</span>
          <div className="floating-character">🦋</div>
        </button>
      </div>

              
    </nav>
  );
};
