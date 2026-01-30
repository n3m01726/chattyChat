// features/auth/RegisterScreen.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Écran d'inscription avec email/password
 */
export const RegisterScreen = ({ onSwitchToLogin, onSuccess }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    const result = await register(email, username, password);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || 'Erreur lors de l\'inscription');
    }

    setLoading(false);
  };

  return (
    <div className="login-screen">
      <h1>💬 Chat Temps Réel</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
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
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          Déjà inscrit ?{' '}
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="auth-link"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
};