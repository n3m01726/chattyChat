// components/AppHeader.jsx
import React from 'react';
import { Users, Hash } from 'lucide-react';

/**
 * Header global de l'application (top bar)
 */
export const AppHeader = ({ 
  channelName, 
  channelDescription, 
  userCount, 
  onMembersClick,
  onChannelsClick,
  leftSidebarOpen,
  rightSidebarOpen
}) => {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          className="app-header__members-btn"
          onClick={onChannelsClick}
          title={leftSidebarOpen ? "Masquer les canaux" : "Afficher les canaux"}
        >
          <Hash size={18} />
          <span>Canaux</span>
        </button>
        
        <div className="app-header__channel-info">
          <h1>{channelName}</h1>
          <p>{channelDescription}</p>
        </div>
      </div>
      
      <div className="app-header__right">
        <div className="app-header__user-count">
          <span>👥</span>
          <span>{userCount} en ligne</span>
        </div>
        
        <button 
          className="app-header__members-btn"
          onClick={onMembersClick}
          title={rightSidebarOpen ? "Masquer les membres" : "Afficher les membres"}
        >
          <Users size={18} />
          <span>Membres</span>
        </button>
      </div>
    </header>
  );
};