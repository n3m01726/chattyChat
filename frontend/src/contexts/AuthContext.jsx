// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { SOCKET_URL } from '../utils/constants';

const AuthContext = createContext(null);

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

    // Charger lastEmail
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

      // Tentative de refresh UNIQUEMENT si un refresh token existe
      const hasRefreshToken = document.cookie.includes('refreshToken=');
      if (hasRefreshToken) {
        const refreshed = await refreshToken();
        if (!refreshed) {
          setUser(null);
        }
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

      // Revalider l’utilisateur après refresh
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
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur connexion:', error);
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

  const value = {
    user,
    loading,
    lastEmail,
    register,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
