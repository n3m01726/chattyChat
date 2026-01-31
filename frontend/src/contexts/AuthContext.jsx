import React, {
  createContext,
  useState,
  useEffect,
  useRef
} from 'react';
import { SOCKET_URL } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastEmail, setLastEmail] = useState('');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  // Empêche le double appel en dev (React StrictMode)
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    // Charger lastEmail depuis les cookies
    const cookies = document.cookie.split(';');
    const lastEmailCookie = cookies.find(c =>
      c.trim().startsWith('lastEmail=')
    );

    if (lastEmailCookie) {
      setLastEmail(decodeURIComponent(lastEmailCookie.split('=')[1]));
    }

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          return;
        }
      }

      const hasRefreshToken = document.cookie.includes('refreshToken=');
      if (hasRefreshToken) {
        const refreshed = await refreshToken();
        if (!refreshed) setUser(null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) return false;

      const meResponse = await fetch(`${apiUrl}/api/auth/me`, {
        credentials: 'include'
      });

      if (meResponse.ok) {
        const data = await meResponse.json();
        if (data.success) {
          setUser(data.user);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Erreur refresh token:', error);
      return false;
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || data.errors };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur inscription:', error);
      return { success: false, error: 'Erreur serveur' };
    }
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      setUser(data.user);
      setLastEmail(email);
      saveLastLoginInfo(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur connexion:', error);
      return { success: false, error: 'Erreur serveur' };
    }
  };

  const legacyLogin = async (username) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/legacy-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      setUser(data.user);
      saveLastLoginInfo(data.user, true);

      return { success: true, user: data.user, isLegacy: data.isLegacy };
    } catch (error) {
      console.error('Erreur legacy login:', error);
      return { success: false, error: 'Erreur serveur' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setUser(null);
    }
  };

  const saveLastLoginInfo = (userData, isLegacy = false) => {
    const lastLogin = {
      username: userData.username,
      email: userData.email || null,
      isLegacy,
      timestamp: Date.now()
    };

    localStorage.setItem('lastLogin', JSON.stringify(lastLogin));

    if (userData.username) {
      fetch(`${apiUrl}/api/users/${userData.username}`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.profile?.avatar_url) {
            localStorage.setItem(
              'lastLogin',
              JSON.stringify({
                ...lastLogin,
                avatarUrl: data.profile.avatar_url
              })
            );
          }
        })
        .catch(err =>
          console.error('Erreur chargement avatar:', err)
        );
    }
  };

  const getLastLoginInfo = () => {
    try {
      const saved = localStorage.getItem('lastLogin');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erreur lecture lastLogin:', error);
      return null;
    }
  };

  const clearLastLoginInfo = () => {
    localStorage.removeItem('lastLogin');
  };

  const value = {
    user,
    loading,
    lastEmail,
    register,
    login,
    legacyLogin,
    logout,
    checkAuth,
    getLastLoginInfo,
    clearLastLoginInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
