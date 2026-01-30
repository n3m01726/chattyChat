// components/RightSidebar.jsx
import React, { useState, useMemo } from 'react';
import { X, Search, Pin } from 'lucide-react';
import { MemberItem } from './MemberItem';
import { useResizable } from '../hooks/useResizable';

/**
 * Sidebar droite - Liste des membres
 */
export const RightSidebar = ({ 
  members = [], 
  isOpen, 
  onClose, 
  onProfileClick,
  onMentionClick,
  pinSidebar 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { width, isDragging, handlers } = useResizable('rightSidebarWidth', 280, 200, 400);

  // Filtrer et grouper les membres par statut
  const groupedMembers = useMemo(() => {
    const filtered = members.filter(member => {
      const displayName = member.display_name || member.username;
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const groups = {
      online: [],
      away: [],
      busy: [],
      offline: []
    };

    filtered.forEach(member => {
      const status = member.status || 'online';
      if (groups[status]) {
        groups[status].push(member);
      }
    });

    // Trier par messageCount dans chaque groupe
    Object.keys(groups).forEach(status => {
      groups[status].sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0));
    });

    return groups;
  }, [members, searchQuery]);

  const totalMembers = members.length;
  const statusLabels = {
    online: 'En ligne',
    away: 'Absent',
    busy: 'Ne pas déranger',
    offline: 'Hors ligne'
  };

  return (
    <>
      <div 
        className={`sidebar sidebar--right ${!isOpen ? 'sidebar--collapsed' : ''}`}
        style={{ width: isOpen ? `${width}px` : '0' }}
      >
        {/* Resize Handle */}
        <div 
          className={`sidebar__resize-handle sidebar__resize-handle--right ${isDragging ? 'sidebar__resize-handle--dragging' : ''}`}
          {...handlers}
        />

        {/* Header */}
        <div className="sidebar__header">
          <h3>Membres — {totalMembers}</h3>
        
        <button 
            className="sidebar__close"
            onClick={onClose}
            title="Fermer"
          >
            <X size={20} />
          </button>
          </div>
        {/* Search */}
        <div className="sidebar__search">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Members List */}
        <div className="sidebar__content">
          {Object.entries(groupedMembers).map(([status, statusMembers]) => {
            if (statusMembers.length === 0) return null;

            return (
              <div key={status} className="members__section">
                <div className="members__section-header">
                  <span>{statusLabels[status]}</span>
                  <span className="members__section-count">{statusMembers.length}</span>
                </div>
                <div className="members__list">
                  {statusMembers.map(member => (
                    <MemberItem
                      key={member.username}
                      member={member}
                      onProfileClick={onProfileClick}
                      onMentionClick={onMentionClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {totalMembers === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
              Aucun membre en ligne
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
        />
      )}
    </>
  );
};