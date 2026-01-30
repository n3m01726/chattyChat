// features/chat/MentionAutocomplete.jsx
import React, { useEffect, useRef } from 'react';
import { Avatar } from '../../components/Avatar';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Dropdown d'autocomplete pour les mentions @username
 */
export const MentionAutocomplete = ({ 
  members = [], 
  searchQuery = '', 
  selectedIndex = 0,
  onSelect,
  position = { top: 0, left: 0 }
}) => {
  const dropdownRef = useRef(null);
  const selectedItemRef = useRef(null);
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  // Filtrer les membres selon la recherche
  const filteredMembers = members.filter(member => {
    const displayName = (member.display_name || member.username).toLowerCase();
    const username = member.username.toLowerCase();
    const query = searchQuery.toLowerCase();
    return displayName.includes(query) || username.includes(query);
  });

  // Grouper par statut
  const onlineMembers = filteredMembers.filter(m => m.status === 'online');
  const offlineMembers = filteredMembers.filter(m => m.status !== 'online');

  // Scroll automatique vers l'élément sélectionné
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

  if (filteredMembers.length === 0) {
    return (
      <div 
        className="mention-autocomplete" 
        style={{ top: position.top, left: position.left }}
        ref={dropdownRef}
      >
        <div className="mention-autocomplete__empty">
          Aucun membre trouvé
        </div>
      </div>
    );
  }

  let currentIndex = 0;

  const renderMemberItem = (member, index) => {
    const isSelected = index === selectedIndex;
    const displayName = member.display_name || member.username;
    const avatarUrl = member.avatar_url ? `${apiUrl}${member.avatar_url}` : null;
    
    return (
      <div
        key={member.username}
        ref={isSelected ? selectedItemRef : null}
        className={`mention-autocomplete__item ${isSelected ? 'mention-autocomplete__item--selected' : ''}`}
        onClick={() => onSelect(member.username)}
        onMouseEnter={() => {
          // Optional: update selectedIndex on hover
        }}
      >
        <div style={{ marginLeft: '8px', marginRight: '8px', display: 'flex', alignItems: 'center' }}>
        <div className="mention-autocomplete__avatar">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName}
              className="avatar avatar--small"
            />
          ) : (
            <Avatar username={member.username} size="small" />
          )}
          <div className={`mention-autocomplete__status mention-autocomplete__status--${member.status || 'online'}`} />
        </div>
        
        <div className="mention-autocomplete__info">
          <div className="mention-autocomplete__name">@{displayName}</div>
        </div>
      </div>
      </div>
    );
  };

  return (
    <div 
      className="mention-autocomplete" 
      style={{ top: position.top, left: position.left }}
      ref={dropdownRef}
    >
      {onlineMembers.length > 0 && (
        <div className="mention-autocomplete__section">
          <div className="mention-autocomplete__section-header">
            En ligne — {onlineMembers.length}
          </div>
          {onlineMembers.map((member) => {
            const item = renderMemberItem(member, currentIndex);
            currentIndex++;
            return item;
          })}
        </div>
      )}

      {offlineMembers.length > 0 && (
        <div className="mention-autocomplete__section">
          <div className="mention-autocomplete__section-header">
            Hors ligne — {offlineMembers.length}
          </div>
          {offlineMembers.map((member) => {
            const item = renderMemberItem(member, currentIndex);
            currentIndex++;
            return item;
          })}
        </div>
      )}
    </div>
  );
};