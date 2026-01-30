// components/AppFooter.jsx
import React, { useState } from 'react';
import { Settings, Moon, Sun, LogOut } from 'lucide-react';
import { Avatar } from './Avatar';
import { UserMiniProfile } from './UserMiniProfile';
import { SOCKET_URL } from '../utils/constants';

export const AppFooter = ({
  username,
  userProfile,
  darkMode,
  onProfileClick,
  onSettingsClick,
  onToggleDarkMode,
  onLogout
}) => {
  const [showMiniProfile, setShowMiniProfile] = useState(false);

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = userProfile?.avatar_url
    ? `${apiUrl}${userProfile.avatar_url}`
    : null;

  const displayName = userProfile?.display_name || username;
  const statusText = userProfile?.status_text || '';

  return (
    <>
      <footer className="app-footer">
        <div className="app-footer__left">
          <div
            className="app-footer__user"
            onClick={() => setShowMiniProfile(v => !v)}
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

            <div>
              <div className="app-footer__username">{displayName}</div>
              <div className="app-footer__statusText">{statusText}</div>
            </div>
          </div>

          <div className="app-footer__actions">
            <button className="app-footer__btn app-footer__btn--logout"onClick={onSettingsClick}>
              <Settings size={20} />
            </button>

            <button className="app-footer__btn app-footer__btn--logout" onClick={onToggleDarkMode}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="app-footer__btn app-footer__btn--logout" onClick={onLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </footer>

      {showMiniProfile && (
        <UserMiniProfile
          username={username}
          profile={userProfile}
          isOwn={true}
          onEditProfile={() => {
            setShowMiniProfile(false);
            onProfileClick(); // ouvre UserProfile (modal full)
          }}
          onClose={() => setShowMiniProfile(false)}
        />
      )}
    </>
  );
};
