import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingItem } from '../types';
import { shoppingService } from '../services/database';
import './ShoppingList.css';

export function ShoppingList() {
  const { showSuccessMessage } = useApp();
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState<'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'other'>('grocery');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [price, setPrice] = useState('');
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = shoppingService.subscribeToShoppingList((items) => {
      setShoppingItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = async () => {
    if (newItem.trim()) {
      try {
        const itemData: Omit<ShoppingItem, 'id' | 'userId' | 'updatedAt'> = {
          name: newItem.trim(),
          category,
          quantity: parseInt(quantity) || 1,
          unit,
          purchased: false,
          createdAt: new Date()
        };
        
        // Only add price if it's provided and valid
        if (price && price.trim() !== '') {
          const parsedPrice = parseFloat(price);
          if (!isNaN(parsedPrice) && parsedPrice >= 0) {
            itemData.price = parsedPrice;
          }
        }
        
        await shoppingService.addShoppingItem(itemData);
        setNewItem('');
        setQuantity('1');
        setPrice('');
        showSuccessMessage('Shopping item added! 🛒');
      } catch (error) {
        console.error('Error adding shopping item:', error);
        showSuccessMessage('Error adding item. Please try again.');
      }
    }
  };

  const handleTogglePurchased = async (id: string) => {
    try {
      const item = shoppingItems.find(i => i.id === id);
      if (item) {
        await shoppingService.togglePurchased(id, !item.purchased);
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await shoppingService.deleteShoppingItem(id);
      showSuccessMessage('Item removed! 🗑️');
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const categories: Array<'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'other'> = [
    'grocery', 'vegetables-fruits', 'online-shopping', 'medicines', 'household', 'electronics', 'clothing', 'other'
  ];

  // Function to get display names for categories
  const getCategoryDisplayName = (cat: string) => {
    const displayNames: Record<string, string> = {
      'grocery': '🛒 Grocery',
      'vegetables-fruits': '🥬 Vegetables & Fruits',
      'online-shopping': '📱 Online Shopping',
      'medicines': '💊 Medicines',
      'household': '🏠 Household',
      'electronics': '🔌 Electronics',
      'clothing': '👕 Clothing',
      'other': '📦 Other'
    };
    return displayNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const units = ['pcs', 'kg', 'g', 'l', 'ml', 'pairs', 'boxes', 'bottles', 'packets', 'bunches', 'dozen', 'bags'];

  const groupedItems = shoppingItems.reduce((groups, item) => {
    const cat = item.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
    return groups;
  }, {} as Record<string, ShoppingItem[]>);

  const totalItems = shoppingItems.length;
  const purchasedItems = shoppingItems.filter(item => item.purchased).length;
  const totalValue = shoppingItems.reduce((sum, item) => sum + (item.price || 0), 0);

  if (loading) {
    return (
      <div className="shopping-container">
        <div className="loading-spinner">⏳</div>
        <p className="loading-text">Loading your shopping list...</p>
      </div>
    );
  }

  return (
    <div className="shopping-container">
      <div className="shopping-header">
        <div className="shopping-character float">🦄</div>
        <h2>My Magical Shopping List!</h2>
        <p>Never forget what you need to buy! ✨</p>
      </div>

      <div className="shopping-input-section">
        <div className="input-row">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="What do you need to buy? 🛍️"
            className="shopping-input"
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'grocery' | 'vegetables-fruits' | 'online-shopping' | 'medicines' | 'household' | 'electronics' | 'clothing' | 'other')}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {getCategoryDisplayName(cat)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="input-row">
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty"
            className="quantity-input"
            min="1"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="unit-select"
          >
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price in ₹ (optional)"
            className="price-input"
            step="0.01"
            min="0"
          />
          <button onClick={handleAddItem} className="add-item-btn">
            ➕ Add Item
          </button>
        </div>
      </div>

      <div className="shopping-stats">
        <div className="stat-item">
          <span className="stat-number">{totalItems}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{purchasedItems}</span>
          <span className="stat-label">Purchased</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">₹{totalValue.toFixed(2)}</span>
          <span className="stat-label">Total Value</span>
        </div>
      </div>

      {shoppingItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-character">🦄</div>
          <h3>Your shopping list is empty!</h3>
          <p>Add some items above to start shopping! 🛒</p>
        </div>
      ) : (
        <div className="shopping-categories">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="category-section">
              <h3 className="category-title">
                {getCategoryDisplayName(category)} ({items.length})
              </h3>
              <div className="category-items">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`shopping-item ${item.purchased ? 'purchased' : ''}`}
                  >
                    <div className="item-content">
                      <button
                        onClick={() => handleTogglePurchased(item.id)}
                        className={`purchase-checkbox ${item.purchased ? 'checked' : ''}`}
                      >
                        {item.purchased ? '✅' : '⭕'}
                      </button>
                      <span className="item-name">{item.name}</span>
                      <span className="item-details">
                        {item.quantity} {item.unit}
                        {item.price && ` • ₹${item.price.toFixed(2)}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="delete-item-btn"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
