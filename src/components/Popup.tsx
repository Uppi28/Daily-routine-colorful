import React from 'react';
import './Popup.css';

interface PopupProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function Popup({ message, type, isVisible, onClose }: PopupProps) {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '😅';
      case 'info':
        return '💡';
      default:
        return '💫';
    }
  };

  const getCharacter = () => {
    switch (type) {
      case 'success':
        return '🌟';
      case 'error':
        return '🤖';
      case 'info':
        return '🧠';
      default:
        return '✨';
    }
  };

  return (
    <div className={`popup-overlay ${isVisible ? 'show' : ''}`} onClick={onClose}>
      <div className={`popup ${type} ${isVisible ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="popup-character float">{getCharacter()}</div>
        <div className="popup-icon bounce">{getIcon()}</div>
        <div className="popup-message">{message}</div>
        <button className="popup-close" onClick={onClose}>
          ✖️
        </button>
      </div>
    </div>
  );
}
