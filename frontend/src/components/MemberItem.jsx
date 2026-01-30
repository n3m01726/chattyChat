// components/MemberItem.jsx
import React from 'react';
import { AtSign, MessageCircle } from 'lucide-react';
import { Avatar } from './Avatar';
import { SOCKET_URL } from '../utils/constants';

/**
 * Item de membre dans la sidebar
 */
export const MemberItem = ({ 
  member, 
  onProfileClick, 
  onMentionClick,
  onDMClick 
}) => {
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = member.avatar_url ? `${apiUrl}${member.avatar_url}` : null;
  const displayName = member.display_name || member.username;
  
  const handleMention = (e) => {
    e.stopPropagation();
    onMentionClick?.(member.username);
  };
  
  const handleDM = (e) => {
    e.stopPropagation();
    onDMClick?.(member.username);
  };

  return (
    <div 
      className="member-item"
      onClick={() => onProfileClick?.(member.username)}
      title={`Voir le profil de ${displayName}`}
    >
      <div className="member-item__avatar">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName} 
            className="avatar avatar--small"
          />
        ) : (
          <Avatar username={member.username} size="small" />
        )}
        <div className={`member-item__status-indicator member-item__status-indicator--${member.status || 'online'}`} />
      </div>
      
      <div className="member-item__info">
        <div className="member-item__name">{displayName}</div>
        {member.status_text && (
          <div className="member-item__status-text">{member.status_text}</div>
        )}
      </div>
      
      {member.messageCount > 0 && (
        <div className="member-item__badge" title={`${member.messageCount} messages`}>
          {member.messageCount}
        </div>
      )}
      
      <div className="member-item__actions">
        <button
          className="member-item__action-btn"
          onClick={handleMention}
          title="Mentionner"
        >
          <AtSign size={16} />
        </button>
        {/* DM pour Phase 3
        <button
          className="member-item__action-btn"
          onClick={handleDM}
          title="Message privé"
        >
          <MessageCircle size={16} />
        </button>
        */}
      </div>
    </div>
  );
};