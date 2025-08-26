import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { expenseService } from '../services/database';
import './ExpenseTracker.css';

export function ExpenseTracker() {
  const { showSuccessMessage } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'food' | 'transport' | 'entertainment' | 'shopping' | 'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'bills' | 'other'>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryGraph, setShowCategoryGraph] = useState(false);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = expenseService.subscribeToExpenses((expenses) => {
      setExpenses(expenses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddExpense = async () => {
    if (amount && description.trim()) {
      try {
        // Ensure the date is properly formatted for Firebase
        const selectedDate = new Date(date + 'T00:00:00');
        if (isNaN(selectedDate.getTime())) {
          showSuccessMessage('Please select a valid date');
          return;
        }
        
        const expenseData = {
          amount: parseFloat(amount),
          category,
          description: description.trim(),
          date: selectedDate,
          createdAt: new Date()
        };
        
        await expenseService.addExpense(expenseData);
        setAmount('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        showSuccessMessage('Expense added in ₹! 💰');
      } catch (error) {
        console.error('Error adding expense:', error);
        showSuccessMessage('Error adding expense. Please try again.');
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      showSuccessMessage('Expense removed! 🗑️');
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const categories = [
    'food', 'transport', 'entertainment', 'shopping', 'grocery', 'vegetables-fruits', 'online-shopping', 'medicines', 'household', 'electronics', 'clothing', 'bills', 'other'
  ];

  const getCategoryEmoji = (cat: string) => {
    const emojis: Record<string, string> = {
      food: '🍕', transport: '🚗', entertainment: '🎬', 
      shopping: '🛍️', grocery: '🛒', 'vegetables-fruits': '🥬', 'online-shopping': '📱', medicines: '💊',
      household: '🏠', electronics: '🔌', clothing: '👕', bills: '📄', other: '💸'
    };
    return emojis[cat] || '💸';
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      food: '#FF6B9D', transport: '#4ECDC4', entertainment: '#FFB347',
      shopping: '#96C93D', grocery: '#FF8C42', 'vegetables-fruits': '#4CAF50', 'online-shopping': '#9C27B0', medicines: '#F44336',
      household: '#795548', electronics: '#2196F3', clothing: '#E91E63', bills: '#A8E6CF', other: '#FF9A9E'
    };
    return colors[cat] || '#A8E6CF';
  };

  // Helper function to safely convert dates
  const safeDateConversion = (dateValue: any): Date | null => {
    try {
      if (dateValue instanceof Date) {
        return dateValue;
      }
      
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue === 'object' && dateValue.toDate) {
        return dateValue.toDate();
      }
      
      // Handle string dates
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      
      // Handle other date-like objects
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (error) {
      console.error('Date conversion error:', error);
      return null;
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const monthlyExpenses = expenses
    .filter(exp => {
      const expDate = safeDateConversion(exp.date);
      if (!expDate) return false;
      
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const categoryBreakdown = expenses.reduce((breakdown, exp) => {
    breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    return breakdown;
  }, {} as Record<string, number>);

  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = safeDateConversion(a.date);
    const dateB = safeDateConversion(b.date);
    
    if (!dateA || !dateB) {
      return 0; // Keep original order if dates are invalid
    }
    
    return dateB.getTime() - dateA.getTime();
  });

  const toggleCategoryGraph = () => {
    setShowCategoryGraph(!showCategoryGraph);
  };

  if (loading) {
    return (
      <div className="expense-container">
        <div className="loading-spinner">⏳</div>
        <p className="loading-text">Loading your expenses...</p>
      </div>
    );
  }

  return (
    <div className="expense-container">
      <div className="expense-header">
        <div className="expense-character float">🐷</div>
        <h2>My Smart Expense Tracker!</h2>
        <p>Keep track of your spending and save money! 💡</p>
      </div>

      <div className="expense-input-section">
        <div className="input-row">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ₹"
            className="amount-input"
            step="0.01"
            min="0"
            onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'food' | 'transport' | 'entertainment' | 'shopping' | 'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'bills' | 'other')}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {getCategoryEmoji(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="date-input"
          />
        </div>
        
        <div className="input-row">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend money on? 📝"
            className="description-input"
            onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
          />
          <button onClick={handleAddExpense} className="add-expense-btn">
            ➕ Add Expense
          </button>
        </div>
      </div>

      <div className="expense-stats">
        <div className="stat-item">
          <span className="stat-number">₹{totalExpenses.toFixed(2)}</span>
          <span className="stat-label">Total Spent</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">₹{monthlyExpenses.toFixed(2)}</span>
          <span className="stat-label">This Month</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{expenses.length}</span>
          <span className="stat-label">Total Expenses</span>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-character">🐷</div>
          <h3>No expenses tracked yet!</h3>
          <p>Add your first expense above to start tracking! 💰</p>
        </div>
      ) : (
        <>
          <div className="expense-overview">
            <div className="category-graph-section">
              <button 
                onClick={toggleCategoryGraph} 
                className="category-graph-btn"
              >
                {showCategoryGraph ? '📊 Hide Category Graph' : '📊 Show Category Graph'}
              </button>
              
              {showCategoryGraph && (
                <div className="category-graph">
                  <h3>Spending by Category 📊</h3>
                  <div className="graph-container">
                    {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                      const percentage = (amount / totalExpenses) * 100;
                      return (
                        <div key={cat} className="graph-item">
                          <div className="graph-header">
                            <span className="category-icon">{getCategoryEmoji(cat)}</span>
                            <span className="category-name">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                            <span className="category-amount">₹{amount.toFixed(2)}</span>
                          </div>
                          <div className="graph-bar">
                            <div 
                              className="graph-fill"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: getCategoryColor(cat)
                              }}
                            />
                          </div>
                          <span className="percentage">{percentage.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="recent-expenses">
            <h3>Recent Expenses 📋</h3>
            <div className="expense-list">
              {sortedExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="expense-item" data-category={expense.category}>
                  <div className="expense-content">
                    <div className="expense-category">
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      >
                        {getCategoryEmoji(expense.category)} {expense.category}
                      </span>
                    </div>
                    <div className="expense-details">
                      <span className="expense-description">{expense.description}</span>
                      <span className="expense-date">
                        {(() => {
                          const expenseDate = safeDateConversion(expense.date);
                          if (!expenseDate) {
                            return 'Invalid Date';
                          }
                          return expenseDate.toLocaleDateString();
                        })()}
                      </span>
                    </div>
                    <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="delete-expense-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
