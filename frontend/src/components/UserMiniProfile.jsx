// components/UserMiniProfile.jsx
import React from 'react';
import { Avatar } from './Avatar';
import { Pen } from 'lucide-react';
import { SOCKET_URL, USER_STATUSES } from '../utils/constants';

export const UserMiniProfile = ({
  username,
  profile,
  isOwn,
  onEditProfile,
  onClose
}) => {
  if (!profile) return null;

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = profile.avatar_url ? `${apiUrl}${profile.avatar_url}` : null;
  const bannerUrl = profile.banner_url ? `${apiUrl}${profile.banner_url}` : null;

  const displayName = profile.display_name || username;
  const status = profile.status || 'offline';
  const statusText = profile.status_text || '';
  const bio = profile.bio || '';

  const currentStatus =
    USER_STATUSES.find(s => s.value === status) ||
    USER_STATUSES.find(s => s.value === 'offline');

  return (
    <div className="mini-profile-overlay" onClick={onClose}>
      <div
        className="mini-profile"
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        <div
          className="mini-profile__banner"
          style={{
            backgroundImage: bannerUrl
              ? `url(${bannerUrl})`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />

        {/* Avatar */}
        <div className="mini-profile__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} />
          ) : (
            <Avatar username={username} size="large" />
          )}
        </div>

        {/* Infos */}
        <div className="mini-profile__content">
          <div className="mini-profile__name">
            {displayName}
          </div>

          <div className="mini-profile__status">
            <span
              className="status-dot"
              style={{ color: currentStatus.color }}
            >
              {currentStatus.icon}
            </span>
            <span>{currentStatus.label}</span>
          </div>

          {statusText && (
            <div className="mini-profile__status-text">
              {statusText}
            </div>
          )}

          {bio && (
            <div className="mini-profile__bio">
              {bio}
            </div>
          )}

          {isOwn && (
            <button
              className="btn btn--primary btn--block"
              onClick={onEditProfile}
            >
              <Pen size={16} /> Voir profil complet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
