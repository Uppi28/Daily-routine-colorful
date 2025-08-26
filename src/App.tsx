import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navigation } from './components/Navigation';
import { TodoList } from './components/TodoList';
import { ShoppingList } from './components/ShoppingList';
import { MealPlanner } from './components/MealPlanner';
import { ExpenseTracker } from './components/ExpenseTracker';
import { Diary } from './components/Diary';
import { Popup } from './components/Popup';
import { Auth } from './components/Auth';
import { onAuthStateChange, isAuthenticated } from './services/auth';
import './App.css';
import './themes.css';

function AppContent() {
  const { state, dispatch } = useApp();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        dispatch({ type: 'SHOW_POPUP', payload: { message: `Welcome back, ${user.displayName || 'Friend'}! 🎉`, type: 'success' } });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleAuthSuccess = () => {
    // Authentication successful, user state will be updated by the listener
  };

  const handleSignOut = async () => {
    try {
      const { signOutUser } = await import('./services/auth');
      await signOutUser();
      dispatch({ type: 'SHOW_POPUP', payload: { message: 'Signed out successfully! 👋', type: 'info' } });
    } catch (error) {
      dispatch({ type: 'SHOW_POPUP', payload: { message: 'Error signing out', type: 'error' } });
    }
  };

  const renderCurrentSection = () => {
    switch (state.currentSection) {
      case 'todo':
        return <TodoList />;
      case 'shopping':
        return <ShoppingList />;
      case 'meals':
        return <MealPlanner />;
      case 'expenses':
        return <ExpenseTracker />;
      case 'diary':
        return <Diary />;
      default:
        return <TodoList />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p>Loading your daily routine...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <Navigation onSignOut={handleSignOut} user={user} />
      <main className="main-content">
        {renderCurrentSection()}
      </main>
      <Popup
        message={state.popupMessage}
        type={state.popupType}
        isVisible={state.showPopup}
        onClose={() => dispatch({ type: 'HIDE_POPUP' })}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
