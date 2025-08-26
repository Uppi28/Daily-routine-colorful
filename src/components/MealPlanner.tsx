import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MealPlan } from '../types';
import { mealService } from '../services/database';
import './MealPlanner.css';

export function MealPlanner() {
  const { showSuccessMessage } = useApp();
  const [newMeal, setNewMeal] = useState('');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [ingredients, setIngredients] = useState('');
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = mealService.subscribeToMeals((meals) => {
      setMeals(meals);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddMeal = async () => {
    if (newMeal.trim()) {
      try {
        const mealData: Omit<MealPlan, 'id' | 'userId' | 'updatedAt'> = {
          day: selectedDay,
          mealType,
          name: newMeal.trim(),
          ingredients: ingredients.split(',').map(i => i.trim()).filter(i => i),
          createdAt: new Date()
        };
        
        // Only add notes if provided
        if (notes && notes.trim() !== '') {
          mealData.notes = notes.trim();
        }
        
        await mealService.addMeal(mealData);
        setNewMeal('');
        setIngredients('');
        setNotes('');
        showSuccessMessage('Meal added to your plan! 🍕');
      } catch (error) {
        console.error('Error adding meal:', error);
        showSuccessMessage('Error adding meal. Please try again.');
      }
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await mealService.deleteMeal(id);
      showSuccessMessage('Meal removed from plan! 🗑️');
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  const getDayEmoji = (day: string) => {
    const emojis: Record<string, string> = {
      monday: '🌅', tuesday: '🌤️', wednesday: '☀️', thursday: '🌅',
      friday: '🌆', saturday: '🌙', sunday: '🌟'
    };
    return emojis[day] || '📅';
  };

  const getMealTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      breakfast: '🍳', lunch: '🥪', dinner: '🍽️', snack: '🍿'
    };
    return emojis[type] || '🍽️';
  };

  const getMealTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breakfast: '#FFB347', lunch: '#4ECDC4', dinner: '#FF6B9D', snack: '#96C93D'
    };
    return colors[type] || '#FFB347';
  };

  const groupedMeals = meals.reduce((groups, meal) => {
    if (!groups[meal.day]) groups[meal.day] = {};
    if (!groups[meal.day][meal.mealType]) groups[meal.day][meal.mealType] = [];
    groups[meal.day][meal.mealType].push(meal);
    return groups;
  }, {} as Record<string, Record<string, MealPlan[]>>);

  const totalMeals = meals.length;
  const uniqueDays = new Set(meals.map(m => m.day)).size;

  if (loading) {
    return (
      <div className="meal-container">
        <div className="loading-spinner">⏳</div>
        <p className="loading-text">Loading your meal plan...</p>
      </div>
    );
  }

  return (
    <div className="meal-container">
      <div className="meal-header">
        <div className="meal-character float">🍕</div>
        <h2>My Delicious Meal Planner!</h2>
        <p>Plan your meals and never wonder what to cook again! 👨‍🍳</p>
      </div>

      <div className="meal-input-section">
        <div className="input-row">
          <input
            type="text"
            value={newMeal}
            onChange={(e) => setNewMeal(e.target.value)}
            placeholder="What's for dinner? 🍽️"
            className="meal-input"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMeal()}
          />
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="day-select"
          >
            {days.map(day => (
              <option key={day} value={day}>
                {getDayEmoji(day)} {day.charAt(0).toUpperCase() + day.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
            className="meal-type-select"
          >
            {mealTypes.map(type => (
              <option key={type} value={type}>
                {getMealTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="input-row">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ingredients (comma separated)"
            className="ingredients-input"
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="notes-input"
          />
          <button onClick={handleAddMeal} className="add-meal-btn">
            ➕ Add Meal
          </button>
        </div>
      </div>

      <div className="meal-stats">
        <div className="stat-item">
          <span className="stat-number">{totalMeals}</span>
          <span className="stat-label">Total Meals</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{uniqueDays}</span>
          <span className="stat-label">Days Planned</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{Math.ceil(totalMeals / 7)}</span>
          <span className="stat-label">Avg Meals/Day</span>
        </div>
      </div>

      {meals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-character">🍕</div>
          <h3>No meals planned yet!</h3>
          <p>Add your first meal above to start planning! 🎯</p>
        </div>
      ) : (
        <div className="weekly-plan">
          {days.map(day => {
            const dayMeals = groupedMeals[day] || {};
            const hasMeals = Object.values(dayMeals).some(meals => meals.length > 0);
            
            return (
              <div key={day} className={`day-section ${hasMeals ? 'has-meals' : ''}`}>
                <div className="day-header">
                  <span className="day-emoji">{getDayEmoji(day)}</span>
                  <h3 className="day-title">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                </div>
                
                {mealTypes.map(type => {
                  const typeMeals = dayMeals[type] || [];
                  if (typeMeals.length === 0) return null;
                  
                  return (
                    <div key={type} className="meal-type-section">
                      <h4 
                        className="meal-type-title"
                        style={{ color: getMealTypeColor(type) }}
                      >
                        {getMealTypeEmoji(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </h4>
                      <div className="meal-items">
                        {typeMeals.map((meal) => (
                          <div key={meal.id} className="meal-item">
                            <div className="meal-content">
                              <span className="meal-name">{meal.name}</span>
                              {meal.ingredients.length > 0 && (
                                <span className="meal-ingredients">
                                  🥬 {meal.ingredients.join(', ')}
                                </span>
                              )}
                              {meal.notes && (
                                <span className="meal-notes">💭 {meal.notes}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteMeal(meal.id)}
                              className="delete-meal-btn"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {!hasMeals && (
                  <div className="no-meals">
                    <span className="no-meals-text">No meals planned</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
