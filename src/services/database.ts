import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  TodoItem, 
  ShoppingItem, 
  MealPlan, 
  Expense, 
  DiaryEntry 
} from '../types';

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Helper function to get user collection reference
const getUserCollection = (collectionName: string) => {
  const userId = getCurrentUserId();
  return collection(db, 'users', userId, collectionName);
};

// Helper function to add user ID and timestamps to data
const addUserMetadata = (data: any) => ({
  ...data,
  userId: getCurrentUserId(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
});

// Helper function to update timestamp
const updateTimestamp = (data: any) => ({
  ...data,
  updatedAt: serverTimestamp()
});

// Helper function to convert Firestore data to proper JavaScript objects
const convertFirestoreData = (data: any) => {
  const converted = { ...data };
  
  // Convert Timestamps to Dates
  if (converted.date && typeof converted.date === 'object' && converted.date.toDate) {
    converted.date = converted.date.toDate();
  }
  if (converted.createdAt && typeof converted.createdAt === 'object' && converted.createdAt.toDate) {
    converted.createdAt = converted.createdAt.toDate();
  }
  if (converted.updatedAt && typeof converted.updatedAt === 'object' && converted.updatedAt.toDate) {
    converted.updatedAt = converted.updatedAt.toDate();
  }
  
  return converted;
};

// Retry wrapper for Firebase operations
const withRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Firebase operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // If it's a network error, try to reconnect
      if (error.code === 'unavailable' || error.message?.includes('QUIC') || error.message?.includes('network')) {
        try {
          await disableNetwork(db);
          await new Promise(resolve => setTimeout(resolve, 500));
          await enableNetwork(db);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (reconnectError) {
          console.warn('Failed to reconnect to Firebase:', reconnectError);
        }
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
};

// Enhanced onSnapshot wrapper with error handling
const createSafeSnapshot = (
  query: any, 
  callback: (data: any[]) => void,
  errorCallback?: (error: Error) => void
) => {
  return onSnapshot(
    query,
    (snapshot: any) => {
      try {
        const data = snapshot.docs.map((doc: any) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...convertFirestoreData(docData)
          };
        });
        callback(data);
      } catch (error) {
        console.error('Error processing snapshot data:', error);
        if (errorCallback) errorCallback(error as Error);
      }
    },
    (error: any) => {
      console.error('Firestore snapshot error:', error);
      
      // Handle specific error types
      if (error.code === 'unavailable' || error.message?.includes('QUIC')) {
        console.warn('Network error detected, attempting to reconnect...');
        // The retry logic will handle reconnection
      }
      
      if (errorCallback) errorCallback(error);
    }
  );
};

// ===== TODO LIST OPERATIONS =====
export const todoService = {
  // Get todos with real-time updates
  subscribeToTodos: (callback: (todos: TodoItem[]) => void, errorCallback?: (error: Error) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'users', userId, 'todos'),
      orderBy('createdAt', 'desc')
    );
    
    return createSafeSnapshot(q, callback, errorCallback);
  },

  // Add new todo
  addTodo: async (todo: Omit<TodoItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
      const todoData = addUserMetadata(todo);
      const docRef = await addDoc(getUserCollection('todos'), todoData);
      return { id: docRef.id, ...todoData };
    });
  },

  // Update todo
  updateTodo: async (id: string, updates: Partial<TodoItem>) => {
    return withRetry(async () => {
      const todoRef = doc(db, 'users', getCurrentUserId(), 'todos', id);
      const updateData = updateTimestamp(updates);
      await updateDoc(todoRef, updateData);
    });
  },

  // Delete todo
  deleteTodo: async (id: string) => {
    return withRetry(async () => {
      const todoRef = doc(db, 'users', getCurrentUserId(), 'todos', id);
      await deleteDoc(todoRef);
    });
  },

  // Toggle todo completion
  toggleTodo: async (id: string, completed: boolean) => {
    await todoService.updateTodo(id, { completed });
  }
};

// ===== SHOPPING LIST OPERATIONS =====
export const shoppingService = {
  subscribeToShoppingList: (callback: (items: ShoppingItem[]) => void, errorCallback?: (error: Error) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'users', userId, 'shopping'),
      orderBy('createdAt', 'desc')
    );
    
    return createSafeSnapshot(q, callback, errorCallback);
  },

  addShoppingItem: async (item: Omit<ShoppingItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
      const itemData = addUserMetadata(item);
      const docRef = await addDoc(getUserCollection('shopping'), itemData);
      return { id: docRef.id, ...itemData };
    });
  },

  updateShoppingItem: async (id: string, updates: Partial<ShoppingItem>) => {
    return withRetry(async () => {
      const itemRef = doc(db, 'users', getCurrentUserId(), 'shopping', id);
      const updateData = updateTimestamp(updates);
      await updateDoc(itemRef, updateData);
    });
  },

  deleteShoppingItem: async (id: string) => {
    return withRetry(async () => {
      const itemRef = doc(db, 'users', getCurrentUserId(), 'shopping', id);
      await deleteDoc(itemRef);
    });
  },

  togglePurchased: async (id: string, purchased: boolean) => {
    await shoppingService.updateShoppingItem(id, { purchased });
  }
};

// ===== MEAL PLANNER OPERATIONS =====
export const mealService = {
  subscribeToMeals: (callback: (meals: MealPlan[]) => void, errorCallback?: (error: Error) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'users', userId, 'meals'),
      orderBy('createdAt', 'desc')
    );
    
    return createSafeSnapshot(q, callback, errorCallback);
  },

  addMeal: async (meal: Omit<MealPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
      const mealData = addUserMetadata(meal);
      const docRef = await addDoc(getUserCollection('meals'), mealData);
      return { id: docRef.id, ...mealData };
    });
  },

  updateMeal: async (id: string, updates: Partial<MealPlan>) => {
    return withRetry(async () => {
      const mealRef = doc(db, 'users', getCurrentUserId(), 'meals', id);
      const updateData = updateTimestamp(updates);
      await updateDoc(mealRef, updateData);
    });
  },

  deleteMeal: async (id: string) => {
    return withRetry(async () => {
      const mealRef = doc(db, 'users', getCurrentUserId(), 'meals', id);
      await deleteDoc(mealRef);
    });
  }
};

// ===== EXPENSE TRACKER OPERATIONS =====
export const expenseService = {
  subscribeToExpenses: (callback: (expenses: Expense[]) => void, errorCallback?: (error: Error) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'users', userId, 'expenses'),
      orderBy('date', 'desc')
    );
    
    return createSafeSnapshot(q, callback, errorCallback);
  },

  addExpense: async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
      const expenseData = addUserMetadata(expense);
      const docRef = await addDoc(getUserCollection('expenses'), expenseData);
      return { id: docRef.id, ...expenseData };
    });
  },

  updateExpense: async (id: string, updates: Partial<Expense>) => {
    return withRetry(async () => {
      const expenseRef = doc(db, 'users', getCurrentUserId(), 'expenses', id);
      const updateData = updateTimestamp(updates);
      await updateDoc(expenseRef, updateData);
    });
  },

  deleteExpense: async (id: string) => {
    return withRetry(async () => {
      const expenseRef = doc(db, 'users', getCurrentUserId(), 'expenses', id);
      await deleteDoc(expenseRef);
    });
  }
};

// ===== DIARY OPERATIONS =====
export const diaryService = {
  subscribeToDiaryEntries: (callback: (entries: DiaryEntry[]) => void, errorCallback?: (error: Error) => void) => {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'users', userId, 'diary'),
      orderBy('date', 'desc')
    );
    
    return createSafeSnapshot(q, callback, errorCallback);
  },

  addDiaryEntry: async (entry: Omit<DiaryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    return withRetry(async () => {
      const entryData = addUserMetadata(entry);
      const docRef = await addDoc(getUserCollection('diary'), entryData);
      return { id: docRef.id, ...entryData };
    });
  },

  updateDiaryEntry: async (id: string, updates: Partial<DiaryEntry>) => {        
    return withRetry(async () => {
      const entryRef = doc(db, 'users', getCurrentUserId(), 'diary', id);
      const updateData = updateTimestamp(updates);
      await updateDoc(entryRef, updateData);
    });
  },

  deleteDiaryEntry: async (id: string) => {
    return withRetry(async () => {
      const entryRef = doc(db, 'users', getCurrentUserId(), 'diary', id);
      await deleteDoc(entryRef);
    });
  }
};

// ===== BATCH OPERATIONS =====
export const batchService = {
  // Clear all data for a user (useful for testing or account deletion)
  clearAllUserData: async () => {
    return withRetry(async () => {
      const userId = getCurrentUserId();
      const batch = writeBatch(db);
      
      // Get all collections
      const collections = ['todos', 'shopping', 'meals', 'expenses', 'diary'];
      
      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, 'users', userId, collectionName));
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }
      
      await batch.commit();
    });
  },

  // Import data from local storage (useful for migration)
  importFromLocalStorage: async (data: any) => {
    return withRetry(async () => {
      const batch = writeBatch(db);
      const userId = getCurrentUserId();
      
      // Import todos
      if (data.todos) {
        for (const todo of data.todos) {
          const todoRef = doc(collection(db, 'users', userId, 'todos'));
          batch.set(todoRef, addUserMetadata(todo));
        }
      }
      
      // Import shopping items
      if (data.shopping) {
        for (const item of data.shopping) {
          const itemRef = doc(collection(db, 'users', userId, 'shopping'));
          batch.set(itemRef, addUserMetadata(item));
        }
      }
      
      // Import meals
      if (data.meals) {
        for (const meal of data.meals) {
          const mealRef = doc(collection(db, 'users', userId, 'meals'));
          batch.set(mealRef, addUserMetadata(meal));
        }
      }
      
      // Import expenses
      if (data.expenses) {
        for (const expense of data.expenses) {
          const expenseRef = doc(collection(db, 'users', userId, 'expenses'));
          batch.set(expenseRef, addUserMetadata(expense));
        }
      }
      
      // Import diary entries
      if (data.diary) {
        for (const entry of data.diary) {
          const entryRef = doc(collection(db, 'users', userId, 'diary'));
          batch.set(entryRef, addUserMetadata(entry));
        }
      }
      
      await batch.commit();
    });
  }
};
