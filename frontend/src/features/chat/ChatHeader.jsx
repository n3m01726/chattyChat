// components/ChatHeader.jsx
import React from 'react';
import { DarkModeToggle } from '../../components/DarkModeToggle';
import { Avatar } from '../../components/Avatar';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Header du chat avec infos utilisateur
 */
export const ChatHeader = ({ channel_name, channel_description, username, userCount, darkMode, onToggleDarkMode, onUsernameClick, userProfile }) => {
  
  // Construire l'URL complète de l'avatar
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = userProfile?.avatar_url ? `${apiUrl}${userProfile.avatar_url}` : null;
  const displayName = userProfile?.display_name || username;

  return (
    <header className="chat-header">
      <h2>{channel_name}</h2>
      <p><small className="channel-description">{channel_description}</small></p>
      <div className="user-info">
        <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        <div 
          className="current-user clickable" 
          onClick={() => onUsernameClick && onUsernameClick(username)}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="avatar avatar--small"
            />
          ) : (
            <Avatar username={username} size="small" />
          )}
          <span className="username-badge">{displayName}</span>
        </div>
        <span className="user-count">👥 {userCount} en ligne</span>
      </div>
    </header>
  );
};