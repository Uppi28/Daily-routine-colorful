import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DiaryEntry } from '../types';
import { diaryService } from '../services/database';
import './Diary.css';

export function Diary() {
  const { showSuccessMessage } = useApp();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<'happy' | 'sad' | 'excited' | 'calm' | 'energetic' | 'tired'>('happy');
  const [weather, setWeather] = useState('');
  const [activities, setActivities] = useState('');
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    const unsubscribe = diaryService.subscribeToDiaryEntries((entries) => {
      setDiaryEntries(entries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEntry = async () => {
    if (content.trim()) {
      try {
        const entryData = {
          date: new Date(),
          mood,
          content: content.trim(),
          weather: weather.trim() || undefined,
          activities: activities.split(',').map(a => a.trim()).filter(a => a) || undefined,
          createdAt: new Date()
        };
        
        await diaryService.addDiaryEntry(entryData);
        setContent('');
        setWeather('');
        setActivities('');
        setMood('happy');
        showSuccessMessage('Diary entry added! 🦋');
      } catch (error) {
        console.error('Error adding diary entry:', error);
        showSuccessMessage('Error adding entry. Please try again.');
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await diaryService.deleteDiaryEntry(id);
      showSuccessMessage('Entry removed! 🗑️');
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const moods = [
    'happy', 'sad', 'excited', 'calm', 'energetic', 'tired'
  ];

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      happy: '😊', sad: '😢', excited: '🤩', 
      calm: '😌', energetic: '⚡', tired: '😴'
    };
    return emojis[mood] || '😊';
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      happy: '#FFD93D', sad: '#6C5CE7', excited: '#FF6B6B',
      calm: '#A8E6CF', energetic: '#FFB347', tired: '#95A5A6'
    };
    return colors[mood] || '#FFD93D';
  };

  const totalEntries = diaryEntries.length;
  const moodBreakdown = diaryEntries.reduce((breakdown, entry) => {
    breakdown[entry.mood] = (breakdown[entry.mood] || 0) + 1;
    return breakdown;
  }, {} as Record<string, number>);

  const sortedEntries = [...diaryEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="diary-container">
        <div className="loading-spinner">⏳</div>
        <p className="loading-text">Loading your diary...</p>
      </div>
    );
  }

  return (
    <div className="diary-container">
      <div className="diary-header">
        <div className="diary-character float">🦋</div>
        <h2>My Beautiful Diary!</h2>
        <p>Capture your thoughts, feelings, and memories! ✨</p>
      </div>

      <div className="diary-input-section">
        <div className="input-row">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How was your day? What's on your mind? 💭"
            className="diary-textarea"
            rows={4}
          />
        </div>
        
        <div className="input-row">
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as 'happy' | 'sad' | 'excited' | 'calm' | 'energetic' | 'tired')}
            className="mood-select"
          >
            {moods.map(m => (
              <option key={m} value={m}>
                {getMoodEmoji(m)} {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            placeholder="Weather today? 🌤️"
            className="weather-input"
          />
          
          <input
            type="text"
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            placeholder="Activities (comma separated) 🎯"
            className="activities-input"
          />
          
          <button onClick={handleAddEntry} className="add-entry-btn">
            ✨ Add Entry
          </button>
        </div>
      </div>

      <div className="diary-stats">
        <div className="stat-item">
          <span className="stat-number">{totalEntries}</span>
          <span className="stat-label">Total Entries</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{new Set(diaryEntries.map(e => e.date.toDateString())).size}</span>
          <span className="stat-label">Days Written</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{Math.ceil(totalEntries / 7)}</span>
          <span className="stat-label">Avg Entries/Week</span>
        </div>
      </div>

      {diaryEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-character">🦋</div>
          <h3>Your diary is empty!</h3>
          <p>Write your first entry above to start journaling! ✍️</p>
        </div>
      ) : (
        <>
          <div className="diary-overview">
            <div className="mood-breakdown">
              <h3>Mood Overview 📊</h3>
              <div className="mood-chart">
                {Object.entries(moodBreakdown).map(([moodType, count]) => {
                  const percentage = (count / totalEntries) * 100;
                  return (
                    <div key={moodType} className="mood-item">
                      <div className="mood-header">
                        <span className="mood-emoji">{getMoodEmoji(moodType)}</span>
                        <span className="mood-name">{moodType.charAt(0).toUpperCase() + moodType.slice(1)}</span>
                        <span className="mood-count">{count}</span>
                      </div>
                      <div className="mood-bar">
                        <div 
                          className="mood-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getMoodColor(moodType)
                          }}
                        />
                      </div>
                      <span className="mood-percentage">{percentage.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="recent-entries">
            <h3>Recent Entries 📖</h3>
            <div className="entry-list">
              {sortedEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="diary-entry">
                  <div className="entry-header">
                    <div className="entry-mood">
                      <span 
                        className="mood-badge"
                        style={{ backgroundColor: getMoodColor(entry.mood) }}
                      >
                        {getMoodEmoji(entry.mood)} {entry.mood}
                      </span>
                    </div>
                    <div className="entry-date">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div className="entry-content">
                    <p className="entry-text">{entry.content}</p>
                  </div>
                  
                  {(entry.weather || entry.activities) && (
                    <div className="entry-details">
                      {entry.weather && (
                        <span className="entry-weather">🌤️ {entry.weather}</span>
                      )}
                      {entry.activities && entry.activities.length > 0 && (
                        <span className="entry-activities">🎯 {entry.activities.join(', ')}</span>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="delete-entry-btn"
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

