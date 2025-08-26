export interface TodoItem {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  category: 'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'other';
  quantity: number;
  unit: string;
  purchased: boolean;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlan {
  id: string;
  userId: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'bills' | 'other';
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: Date;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'energetic' | 'tired';
  content: string;
  weather?: string;
  activities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AppSection = 'todo' | 'shopping' | 'meals' | 'expenses' | 'diary';
