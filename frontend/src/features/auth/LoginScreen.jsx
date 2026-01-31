// features/auth/LoginScreen.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { Avatar } from '../../components/Avatar';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Écran de connexion avec email/password
 */
export const LoginScreen = ({ onSwitchToRegister, onForgotPassword, onSuccess }) => {
  const { login, legacyLogin, lastEmail, getLastLoginInfo } = useAuth();
  const [email, setEmail] = useState(lastEmail || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLegacyLogin, setShowLegacyLogin] = useState(false);
  const [legacyUsername, setLegacyUsername] = useState('');
  
  // Last Login Info
  const [lastLogin, setLastLogin] = useState(null);
  const [useLastLogin, setUseLastLogin] = useState(false);

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    const savedLastLogin = getLastLoginInfo();
    if (savedLastLogin) {
      setLastLogin(savedLastLogin);
      setUseLastLogin(true);
      setEmail(savedLastLogin.email || '');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }

    setLoading(true);

    const result = await login(email, password, rememberMe);

    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setError(result.error || 'Erreur de connexion');
    }

    setLoading(false);
  };

  const handleLegacyLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!legacyUsername) {
      setError('Username requis');
      return;
    }

    setLoading(true);

    const result = await legacyLogin(legacyUsername);

    if (result.success) {
      onSuccess?.(result.user);
    } else {
      setError(result.error || 'Erreur de connexion');
    }

    setLoading(false);
  };

  const handleUseAnotherAccount = () => {
    setUseLastLogin(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="login-screen">
      <h1>💬 Chat Temps Réel</h1>

      {/* Last Login */}
      {useLastLogin && lastLogin && !showLegacyLogin && (
        <div className="last-login-card">
          <div className="last-login-card__avatar">
            {lastLogin.avatarUrl ? (
              <img 
                src={`${apiUrl}${lastLogin.avatarUrl}`} 
                alt={lastLogin.username}
                className="avatar avatar--large"
              />
            ) : (
              <Avatar username={lastLogin.username} size="large" />
            )}
          </div>
          
          <div className="last-login-card__info">
            <h3>{lastLogin.username}</h3>
            {lastLogin.email && <p>{lastLogin.email}</p>}
            {lastLogin.isLegacy && (
              <span className="badge badge--ghost">👻 Compte temporaire</span>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Connexion...' : `Se connecter en tant que ${lastLogin.username}`}
            </button>
          </form>

          <button 
            type="button"
            onClick={handleUseAnotherAccount}
            className="btn btn--secondary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            Utiliser un autre compte
          </button>
        </div>
      )}

      {/* Login normal */}
      {!useLastLogin && !showLegacyLogin && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus={!lastEmail}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoFocus={!!lastEmail}
          />

          <div className="auth-remember">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Se souvenir de moi</span>
            </label>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <button 
            type="button"
            onClick={onForgotPassword}
            className="auth-link"
            style={{ marginTop: '10px', width: '100%', textAlign: 'center' }}
          >
            Mot de passe oublié ?
          </button>
        </form>
      )}

      {/* Legacy Login (Dev only) */}
      {showLegacyLogin && (
        <form onSubmit={handleLegacyLogin}>
          <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
            👻 <strong>Mode développeur</strong> - Connexion rapide sans mot de passe
          </p>

          <input
            type="text"
            placeholder="Username"
            value={legacyUsername}
            onChange={(e) => setLegacyUsername(e.target.value)}
            disabled={loading}
            autoFocus
          />

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Quick Login'}
          </button>

          <button 
            type="button"
            onClick={() => setShowLegacyLogin(false)}
            className="btn btn--secondary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            ← Retour
          </button>
        </form>
      )}

      {!showLegacyLogin && (
        <>
          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="auth-oauth">
            <button className="btn-oauth btn-oauth--google" disabled title="Bientôt disponible">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.482 0 2.438 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>

            <button className="btn-oauth btn-oauth--discord" disabled title="Bientôt disponible">
              <svg width="18" height="18" viewBox="0 0 71 55" fill="#5865F2">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
              </svg>
              Continuer avec Discord
            </button>
          </div>
        </>
      )}

      <div className="auth-switch">
        <p>
          Pas encore de compte ?{' '}
          <button 
            type="button" 
            onClick={onSwitchToRegister}
            className="auth-link"
          >
            S'inscrire
          </button>
        </p>

        {isDev && !showLegacyLogin && (
          <p style={{ marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={() => setShowLegacyLogin(true)}
              className="auth-link"
              style={{ fontSize: '12px', color: '#999' }}
            >
              👻 Mode développeur
            </button>
          </p>
        )}
      </div>
    </div>
  );
};