// components/TypingIndicator.jsx
import React from 'react';
import { formatTypingUsers } from '../../utils/formatters';

/**
 * Indicateur "X est en train d'écrire..."
 */
export const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.size === 0) return null;

  return (
    <div className="typing-indicator">
      {formatTypingUsers(typingUsers)}
    </div>
  );
};