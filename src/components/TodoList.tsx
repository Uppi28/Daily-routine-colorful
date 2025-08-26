import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TodoItem } from '../types';
import { todoService } from '../services/database';
import './TodoList.css';

export function TodoList() {
  const { state, dispatch, showSuccessMessage } = useApp();
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = todoService.subscribeToTodos((todos) => {
      setTodos(todos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTodo = async () => {
    if (newTodo.trim()) {
      try {
        const todoData = {
          text: newTodo.trim(),
          completed: false,
          priority,
          createdAt: new Date()
        };
        
        await todoService.addTodo(todoData);
        setNewTodo('');
        showSuccessMessage('New task added! 🎉');
      } catch (error) {
        console.error('Error adding todo:', error);
        showSuccessMessage('Error adding task. Please try again.');
      }
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        await todoService.toggleTodo(id, !todo.completed);
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      showSuccessMessage('Task completed! 🎯');
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B9D';
      case 'medium': return '#FFB347';
      case 'low': return '#4ECDC4';
      default: return '#FFB347';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'high': return '🚨';
      case 'medium': return '⚡';
      case 'low': return '🐌';
      default: return '⚡';
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (loading) {
    return (
      <div className="todo-container">
        <div className="loading-spinner">⏳</div>
        <p className="loading-text">Loading your todos...</p>
      </div>
    );
  }

  return (
    <div className="todo-container">
      <div className="todo-header">
        <div className="todo-character float">🤖</div>
        <h2>My Awesome To-Do List!</h2>
        <p>Let's get things done together! 💪</p>
      </div>

      <div className="todo-input-section">
        <div className="input-group">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="What do you want to do today? ✨"
            className="todo-input"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="priority-select"
          >
            <option value="low">🐌 Low</option>
            <option value="medium">⚡ Medium</option>
            <option value="high">🚨 High</option>
          </select>
          <button onClick={handleAddTodo} className="add-todo-btn">
            ➕ Add Task
          </button>
        </div>
      </div>

      <div className="todo-stats">
        <div className="stat-item">
          <span className="stat-number">{todos.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => t.completed).length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
          <span className="stat-label">Pending</span>
        </div>
      </div>

      {todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-character">🤖</div>
          <h3>No tasks yet!</h3>
          <p>Add your first task above to get started! 🚀</p>
        </div>
      ) : (
        <div className="todo-list">
          {sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-content">
                <button
                  onClick={() => handleToggleTodo(todo.id)}
                  className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                >
                  {todo.completed ? '✅' : '⭕'}
                </button>
                <span className="todo-text">{todo.text}</span>
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                >
                  {getPriorityEmoji(todo.priority)} {todo.priority}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="delete-todo-btn"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
