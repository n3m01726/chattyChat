// components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Avatar } from '../../components/Avatar';
import { Pen, Camera, Hourglass, CircleDollarSign, Webcam, Heart } from 'lucide-react';

import { 
  SOCKET_URL, 
  USER_STATUSES, 
  TIMEZONES,
  MAX_BIO_LENGTH,
  MAX_STATUS_LENGTH,
  MAX_DISPLAY_NAME_LENGTH
} from '../../utils/constants';

/**
 * Modal de profil utilisateur étendu
 */
export const UserProfile = ({ 
  username, 
  isOwn, 
  onClose, 
  darkMode, 
  onToggleDarkMode,
  onProfileUpdate 
}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  
  // États pour les champs éditables
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [status, setStatus] = useState('online');
  const [statusText, setStatusText] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${username}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        // Initialiser les états
        setBio(data.profile.bio || '');
        setDisplayName(data.profile.display_name || '');
        setPronouns(data.profile.pronouns || '');
        setCustomColor(data.profile.custom_color || '');
        setStatus(data.profile.status || 'online');
        setStatusText(data.profile.status_text || '');
        setTimezone(data.profile.timezone || 'UTC');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          display_name: displayName || null,
          pronouns: pronouns || null,
          custom_color: customColor || null,
          status,
          status_text: statusText || null,
          timezone,
          dark_mode: darkMode
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        setEditing(false);
        
        // Notifier le parent pour mettre à jour l'affichage
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`${apiUrl}/api/users/${username}/avatar`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('banner', file);

    try {
      const response = await fetch(`${apiUrl}/api/users/${username}/banner`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
        if (onProfileUpdate) {
          onProfileUpdate(data.profile);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload du banner:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const currentStatus = USER_STATUSES.find(s => s.value === (profile.status || 'online'));
  const displayUsername = profile.display_name || username;
  const avatarUrl = profile.avatar_url ? `${apiUrl}${profile.avatar_url}` : null;
  const bannerUrl = profile.banner_url ? `${apiUrl}${profile.banner_url}` : null;

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className="modal__content user-profile-modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        
        {/* Banner */}
        <div 
          className="profile__banner"
          style={{ 
            backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          {isOwn && editing && (
            <label className="upload-banner-btn">
              {uploadingBanner ? '⏳' : ''} Upload your cover
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleBannerUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Header avec avatar */}
        <div className="profile-header-with-avatar">
          <div className="profile__avatar-container">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayUsername} className="profile__avatar-img" />
            ) : (
              <Avatar username={username} size="large" />
            )}
            {isOwn && editing && (
              <label className="upload-avatar-btn">
                {uploadingAvatar ? <Hourglass size={16}/> : <Camera size={16} />}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
          
          <div className="profile__info">
            <div className="profile__name-row">
              <h2>{displayUsername}</h2>
              {profile.pronouns && <span className="pronouns">({profile.pronouns})</span>}
            </div>
            <p className="profile__username">@{username}</p>
            <div className="profile__status">
              <span className="status__indicator" style={{ color: currentStatus.color }}>
                {currentStatus.icon}
              </span>
              <span className="status__label">{currentStatus.label}</span>
              {profile.status_text && <span className="status__text"> - {profile.status_text}</span>}
            </div>
            
          </div>
        </div>
        {/* Actions */}
        {!isOwn && (<>
          <div className="profile__actions">
          
              <button className="btn btn--disabled icon-text">
                <CircleDollarSign size={16}/>  Tips
              </button>
              <button className="btn btn--disabled icon-text">
                <Webcam size={16}/>  Watch Free streams
              </button>
              <button className="btn btn--disabled icon-text">
                <Heart size={16}/>
              </button>
          </div> </>
        )}




        {/* Actions Own account*/}
        {isOwn && (
          <div className="profile__actions">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="btn btn--primary icon-text">
                <Pen size={16}/>  Modifier le profil 
              </button>
            ) : (
              <>

                <button onClick={handleSave} className="btn btn--primary" disabled={saving}>
                  {saving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
                <button onClick={() => setEditing(false)} className="btn btn--secondary">
                  Annuler
                </button>
              </>
            )}
          </div>
        )}

        {/* Statistiques */}
        <div className="profile__stats">
          <div className="stat">
            <span className="stat__value">{profile.messageCount || 0}</span>
            <span className="stat__label">Messages</span>
          </div>
          <div className="stat">
            <span className="stat__value">{formatDate(profile.created_at)}</span>
            <span className="stat__label">Membre depuis</span>
          </div>
        </div>

        {/* Sections éditables */}
        {editing ? (
          <div className="profile__edit-form">
            <div className="status-group form-group">
            {/* Status */}
            <div className="status-select">
              <label>Statut</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {USER_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Text */}
            
            <div className="form-group">
              <label>Message de statut</label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="Que fais-tu en ce moment ?"
                maxLength={MAX_STATUS_LENGTH}
              />
              <small>{statusText.length}/{MAX_STATUS_LENGTH}</small>
            </div>
</div>


            {/* Display Name */}
            <div className="form-group">
              <label>Nom d'affichage</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={username}
                maxLength={MAX_DISPLAY_NAME_LENGTH}
              />
              <small>{displayName.length}/{MAX_DISPLAY_NAME_LENGTH}</small>
            </div>

            {/* Pronouns */}
            <div className="form-group">
              <label>Pronoms</label>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                placeholder="il/lui, elle/elle, iel/iel..."
                maxLength={30}
              />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Parle-nous de toi..."
                maxLength={MAX_BIO_LENGTH}
                rows={4}
              />
              <small>{bio.length}/{MAX_BIO_LENGTH}</small>
            </div>



            {/* Custom Color */}
            <div className="form-group">
              <label>Couleur personnalisée</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  value={customColor || '#667eea'}
                  onChange={(e) => setCustomColor(e.target.value)}
                />
                <input
                  type="text"
                  value={customColor || ''}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#667eea"
                  maxLength={7}
                />
                {customColor && (
                  <button 
                    onClick={() => setCustomColor('')}
                    className="btn-clear"
                    title="Réinitialiser"
                  >
                    ↺
                  </button>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div className="form-group">
              <label>Fuseau horaire</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode */}
            <div className="form-group form-group-row">
            </div>
          </div>
        ) : (
          <div className="profile-view">
            {bio && (
              <div className="profile-section">
                <h3>bio</h3>
                <p>{bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};