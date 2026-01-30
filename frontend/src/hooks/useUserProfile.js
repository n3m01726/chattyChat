import { useState, useEffect } from 'react';
import { SOCKET_URL, USER_STATUSES, TIMEZONES } from '../utils/constants';

export const useUserProfile = (username) => {
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Champs éditables
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [customColor, setCustomColor] = useState('');
  const [status, setStatus] = useState('online');
  const [statusText, setStatusText] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Avatar / Banner upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Compte / Auth
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState(null);
  const [accountSuccess, setAccountSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/users/${username}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setBio(data.profile.bio || '');
        setDisplayName(data.profile.display_name || '');
        setPronouns(data.profile.pronouns || '');
        setCustomColor(data.profile.custom_color || '');
        setStatus(data.profile.status || 'online');
        setStatusText(data.profile.status_text || '');
        setTimezone(data.profile.timezone || 'UTC');
        setEmail(data.profile.email || '');
      }
    } catch (e) {
      console.error('Erreur fetchProfile', e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/users/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          display_name: displayName || null,
          pronouns: pronouns || null,
          custom_color: customColor || null,
          status,
          status_text: statusText || null,
          timezone
        }),
      });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
    } catch (e) {
      console.error('Erreur saveProfile', e);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch(`${apiUrl}/api/users/${username}/avatar`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
    } catch (e) {
      console.error('Erreur uploadAvatar', e);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadBanner = async (file) => {
    if (!file) return;
    setUploadingBanner(true);
    const formData = new FormData();
    formData.append('banner', file);
    try {
      const res = await fetch(`${apiUrl}/api/users/${username}/banner`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
    } catch (e) {
      console.error('Erreur uploadBanner', e);
    } finally {
      setUploadingBanner(false);
    }
  };

  const resetAccountMessages = () => {
    setAccountError(null);
    setAccountSuccess(null);
  };

  const isGhostAccount = profile && !profile.email;

  const completeGhostAccount = async () => {
    resetAccountMessages();
    setAccountLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/complete-profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) setAccountError(data.error || data.errors?.join(', '));
      else {
        setAccountSuccess('Compte complété avec succès');
        fetchProfile();
      }
    } finally { setAccountLoading(false); }
  };

  const updateCredentials = async () => {
    resetAccountMessages();
    setAccountLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/update-credentials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          email: email || undefined,
          newPassword: newPassword || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) setAccountError(data.error || data.errors?.join(', '));
      else {
        setAccountSuccess('Informations mises à jour');
        fetchProfile();
      }
    } finally { setAccountLoading(false); }
  };

  const suspendAccount = async () => {
    await fetch(`${apiUrl}/api/auth/suspend`, { method: 'POST', credentials: 'include' });
    window.location.reload();
  };

  const deleteAccount = async () => {
    if (!currentPassword) { setAccountError('Mot de passe requis'); return; }
    await fetch(`${apiUrl}/api/auth/me`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: currentPassword })
    });
    window.location.reload();
  };

  return {
    profile, loading, saving,
    bio, setBio,
    displayName, setDisplayName,
    pronouns, setPronouns,
    customColor, setCustomColor,
    status, setStatus,
    statusText, setStatusText,
    timezone, setTimezone,
    uploadingAvatar, uploadingBanner,
    saveProfile, uploadAvatar, uploadBanner, fetchProfile,
    email, setEmail, currentPassword, setCurrentPassword, newPassword, setNewPassword,
    accountLoading, accountError, accountSuccess,
    isGhostAccount, completeGhostAccount, updateCredentials, suspendAccount, deleteAccount
  };
};
