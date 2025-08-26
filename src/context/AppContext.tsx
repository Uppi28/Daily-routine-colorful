import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TodoItem, ShoppingItem, MealPlan, Expense, DiaryEntry, AppSection } from '../types';

interface AppState {
  currentSection: AppSection;
  todos: TodoItem[];
  shoppingItems: ShoppingItem[];
  mealPlans: MealPlan[];
  expenses: Expense[];
  diaryEntries: DiaryEntry[];
  showPopup: boolean;
  popupMessage: string;
  popupType: 'success' | 'error' | 'info';
}

type AppAction =
  | { type: 'SET_SECTION'; payload: AppSection }
  | { type: 'ADD_TODO'; payload: TodoItem }
  | { type: 'TOGGLE_TODO'; payload: string }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'ADD_SHOPPING_ITEM'; payload: ShoppingItem }
  | { type: 'TOGGLE_SHOPPING_ITEM'; payload: string }
  | { type: 'DELETE_SHOPPING_ITEM'; payload: string }
  | { type: 'ADD_MEAL_PLAN'; payload: MealPlan }
  | { type: 'DELETE_MEAL_PLAN'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_DIARY_ENTRY'; payload: DiaryEntry }
  | { type: 'DELETE_DIARY_ENTRY'; payload: string }
  | { type: 'SHOW_POPUP'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'HIDE_POPUP' };

const initialState: AppState = {
  currentSection: 'todo',
  todos: [],
  shoppingItems: [],
  mealPlans: [],
  expenses: [],
  diaryEntries: [],
  showPopup: false,
  popupMessage: '',
  popupType: 'info'
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, currentSection: action.payload };
    
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'ADD_SHOPPING_ITEM':
      return { ...state, shoppingItems: [...state.shoppingItems, action.payload] };
    
    case 'TOGGLE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingItems: state.shoppingItems.map(item =>
          item.id === action.payload ? { ...item, purchased: !item.purchased } : item
        )
      };
    
    case 'DELETE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingItems: state.shoppingItems.filter(item => item.id !== action.payload)
      };
    
    case 'ADD_MEAL_PLAN':
      return { ...state, mealPlans: [...state.mealPlans, action.payload] };
    
    case 'DELETE_MEAL_PLAN':
      return {
        ...state,
        mealPlans: state.mealPlans.filter(meal => meal.id !== action.payload)
      };
    
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    
    case 'ADD_DIARY_ENTRY':
      return { ...state, diaryEntries: [...state.diaryEntries, action.payload] };
    
    case 'DELETE_DIARY_ENTRY':
      return {
        ...state,
        diaryEntries: state.diaryEntries.filter(entry => entry.id !== action.payload)
      };
    
    case 'SHOW_POPUP':
      return {
        ...state,
        showPopup: true,
        popupMessage: action.payload.message,
        popupType: action.payload.type
      };
    
    case 'HIDE_POPUP':
      return { ...state, showPopup: false };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
  showInfoMessage: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedShopping = localStorage.getItem('shoppingItems');
    const savedMeals = localStorage.getItem('mealPlans');
    const savedExpenses = localStorage.getItem('expenses');
    const savedDiary = localStorage.getItem('diaryEntries');

    if (savedTodos) {
      const todos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }));
      todos.forEach((todo: TodoItem) => dispatch({ type: 'ADD_TODO', payload: todo }));
    }

    if (savedShopping) {
      const shopping = JSON.parse(savedShopping);
      shopping.forEach((item: ShoppingItem) => dispatch({ type: 'ADD_SHOPPING_ITEM', payload: item }));
    }

    if (savedMeals) {
      const meals = JSON.parse(savedMeals);
      meals.forEach((meal: MealPlan) => dispatch({ type: 'ADD_MEAL_PLAN', payload: meal }));
    }

    if (savedExpenses) {
      const expenses = JSON.parse(savedExpenses).map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
      expenses.forEach((expense: Expense) => dispatch({ type: 'ADD_EXPENSE', payload: expense }));
    }

    if (savedDiary) {
      const diary = JSON.parse(savedDiary).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      diary.forEach((entry: DiaryEntry) => dispatch({ type: 'ADD_DIARY_ENTRY', payload: entry }));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(state.todos));
  }, [state.todos]);

  useEffect(() => {
    localStorage.setItem('shoppingItems', JSON.stringify(state.shoppingItems));
  }, [state.shoppingItems]);

  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(state.mealPlans));
  }, [state.mealPlans]);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
  }, [state.expenses]);

  useEffect(() => {
    localStorage.setItem('diaryEntries', JSON.stringify(state.diaryEntries));
  }, [state.diaryEntries]);

  const showSuccessMessage = (message: string) => {
    dispatch({ type: 'SHOW_POPUP', payload: { message, type: 'success' } });
    setTimeout(() => dispatch({ type: 'HIDE_POPUP' }), 3000);
  };

  const showErrorMessage = (message: string) => {
    dispatch({ type: 'SHOW_POPUP', payload: { message, type: 'error' } });
    setTimeout(() => dispatch({ type: 'HIDE_POPUP' }), 3000);
  };

  const showInfoMessage = (message: string) => {
    dispatch({ type: 'SHOW_POPUP', payload: { message, type: 'info' } });
    setTimeout(() => dispatch({ type: 'HIDE_POPUP' }), 3000);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, showSuccessMessage, showErrorMessage, showInfoMessage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
