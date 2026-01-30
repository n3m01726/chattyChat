// features/chat/MentionToast.jsx
import React, { useEffect } from 'react';
import { X, AtSign } from 'lucide-react';

/**
 * Toast de notification quand on est mentionné
 */
export const MentionToast = ({ mention, onClose, onNavigate }) => {
  useEffect(() => {
    // Auto-close après 5 secondes
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(mention.messageId);
    }
    onClose();
  };

  // Tronquer le texte si trop long
  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className="mention-toast" 
      onClick={handleClick}
    >
      <div className="mention-toast__icon">
        <AtSign size={20} />
      </div>
      
      <div className="mention-toast__content">
        <div className="mention-toast__title">
          <strong>{mention.author}</strong> vous a mentionné
        </div>
        <div className="mention-toast__message">
          {truncateText(mention.text)}
        </div>
      </div>
      
      <button 
        className="mention-toast__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};