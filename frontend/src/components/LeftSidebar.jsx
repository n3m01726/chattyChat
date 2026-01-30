// components/LeftSidebar.jsx
import React from 'react';
import { X, Hash } from 'lucide-react';
import { useResizableLeft } from '../hooks/useResizable';

/**
 * Sidebar gauche - Liste des canaux (TODO: Multi-channel system)
 */
export const LeftSidebar = ({ 
  channels = [], 
  currentChannel = 'general',
  isOpen, 
  onClose,
  onChannelClick 
}) => {
  const { width, isDragging, handlers } = useResizableLeft('leftSidebarWidth', 280, 200, 400);

  // Placeholder channels (TODO: Récupérer depuis le backend)
  const placeholderChannels = [
    { id: 'general', name: 'general', icon: '#', unread: 0 },
    { id: 'random', name: 'random', icon: '#', unread: 0 },
    { id: 'memes', name: 'memes', icon: '#', unread: 0 },
  ];

  const displayChannels = channels.length > 0 ? channels : placeholderChannels;

  return (
    <>
      <div 
        className={`sidebar sidebar--left ${!isOpen ? 'sidebar--collapsed' : ''}`}
        style={{ width: isOpen ? `${width}px` : '0' }}
      >
        {/* Resize Handle */}
        <div 
          className={`sidebar__resize-handle sidebar__resize-handle--left ${isDragging ? 'sidebar__resize-handle--dragging' : ''}`}
          {...handlers}
        />

        {/* Header */}
        <div className="sidebar__header">
          <h3>Canaux</h3>
          <button 
            className="sidebar__close"
            onClick={onClose}
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Channels List */}
        <div className="sidebar__content">
          <div className="channels__list">
            {displayChannels.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${currentChannel === channel.id ? 'channel-item--active' : ''}`}
                onClick={() => onChannelClick?.(channel.id)}
              >
                <span className="channel-item__icon">{channel.icon}</span>
                <span className="channel-item__name">{channel.name}</span>
                {channel.unread > 0 && (
                  <span className="channel-item__unread">{channel.unread}</span>
                )}
              </div>
            ))}
          </div>

          {/* TODO Message */}
          <div className="channels__todo">
            <strong>📝 TODO:</strong> Multi-channel system à venir dans une prochaine phase !
          </div>
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