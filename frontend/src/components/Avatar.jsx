// components/Avatar.jsx
import React from 'react';
import { getInitials, stringToColor } from '../utils/formatters';

/**
 * Composant Avatar avec initiales et couleur unique
 */
export const Avatar = ({ username, size = 'medium', clickable = false }) => {
  const initials = getInitials(username);
  const color = stringToColor(username);

  const sizeClass = `avatar--${size}`;
  const clickableClass = clickable ? 'avatar--clickable' : '';

  return (
    <div 
      className={`avatar ${sizeClass} ${clickableClass}`.trim()}
      style={{ backgroundColor: color }}
      title={username}
    >
      {initials}
    </div>
  );
};