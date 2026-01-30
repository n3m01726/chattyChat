// features/chat/MentionToastContainer.jsx
import React from 'react';
import { MentionToast } from './MentionToast';

/**
 * Container pour afficher plusieurs toasts de mention
 */
export const MentionToastContainer = ({ mentions, onRemoveMention, onNavigateToMessage }) => {
  if (mentions.length === 0) return null;

  return (
    <div className="mention-toast-container">
      {mentions.map((mention) => (
        <MentionToast
          key={mention.id}
          mention={mention}
          onClose={() => onRemoveMention(mention.id)}
          onNavigate={onNavigateToMessage}
        />
      ))}
    </div>
  );
};