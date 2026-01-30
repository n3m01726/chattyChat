// hooks/useDarkMode.js
import { useState, useEffect } from 'react';

/**
 * Hook pour gérer le dark mode avec persistance
 * Synchronise avec le profil utilisateur si disponible
 */
export const useDarkMode = (initialValue = false) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Charger depuis localStorage au démarrage
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : initialValue;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  const setDarkModeValue = (value) => setDarkMode(value);

  return { darkMode, toggleDarkMode, setDarkModeValue };
};