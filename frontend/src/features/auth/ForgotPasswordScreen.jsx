// features/auth/ForgotPasswordScreen.jsx
import React, { useState } from 'react';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Écran de demande de réinitialisation de mot de passe
 */
export const ForgotPasswordScreen = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Email requis');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // En dev, on reçoit le token directement
        if (data.token) {
          setResetToken(data.token);
        }
      } else {
        setError(data.error || 'Erreur lors de la demande');
      }
    } catch (error) {
      console.error('Erreur forgot-password:', error);
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResetLink = () => {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    navigator.clipboard.writeText(resetUrl);
    alert('Lien copié dans le presse-papiers !');
  };

  return (
    <div className="login-screen">
      <h1>🔑 Mot de passe oublié</h1>

      {!success ? (
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
          />

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
      ) : (
        <div className="auth-success">
          <p style={{ marginBottom: '20px' }}>
            ✅ Si cet email existe dans notre base, un lien de réinitialisation a été envoyé.
          </p>

          {resetToken && (
            <div style={{ 
              background: '#f0f0f0', 
              padding: '15px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                <strong>Mode développement :</strong>
              </p>
              <button 
                onClick={handleCopyResetLink}
                className="btn btn--secondary"
                style={{ width: '100%' }}
              >
                📋 Copier le lien de réinitialisation
              </button>
            </div>
          )}
        </div>
      )}

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