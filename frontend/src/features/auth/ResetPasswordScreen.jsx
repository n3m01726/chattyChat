// features/auth/ResetPasswordScreen.jsx
import React, { useState, useEffect } from 'react';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Écran de réinitialisation de mot de passe avec token
 */
export const ResetPasswordScreen = ({ token, onSuccess, onBackToLogin }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/verify-reset-token?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setTokenValid(true);
        setEmail(data.email);
      } else {
        setError(data.error || 'Token invalide ou expiré');
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Erreur vérification token:', error);
      setError('Erreur serveur');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
      } else {
        setError(data.error || data.errors?.join(', ') || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Erreur reset-password:', error);
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="login-screen">
        <h1>🔑 Réinitialisation</h1>
        <p>Vérification du lien...</p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="login-screen">
        <h1>🔑 Lien invalide</h1>
        <div className="auth-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
        <button onClick={onBackToLogin} className="btn btn--primary">
          Retour à la connexion
        </button>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <h1>🔑 Nouveau mot de passe</h1>

      <p style={{ marginBottom: '20px', color: '#666' }}>
        Créez un nouveau mot de passe pour <strong>{email}</strong>
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          <button 
            type="button" 
            onClick={onBackToLogin}
            className="auth-link"
          >
            ← Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
};