// hooks/useResizable.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Hook pour rendre un élément resizable avec drag handle
 * @param {string} storageKey - Clé pour persister la largeur dans localStorage
 * @param {number} defaultWidth - Largeur par défaut
 * @param {number} minWidth - Largeur minimum
 * @param {number} maxWidth - Largeur maximum
 */
export const useResizable = (storageKey, defaultWidth = 280, minWidth = 200, maxWidth = 400) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved) : defaultWidth;
  });
  
  const [isDragging, setIsDragging] = useState(false);

  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback((e) => {
    if (!isDragging) return;

    // Pour sidebar à droite, calculer depuis le bord droit
    const newWidth = window.innerWidth - e.clientX;
    
    // Limiter entre min et max
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(clampedWidth);
    localStorage.setItem(storageKey, clampedWidth.toString());
  }, [isDragging, minWidth, maxWidth, storageKey]);

  const resizeLeft = useCallback((e) => {
    if (!isDragging) return;

    // Pour sidebar à gauche, calculer depuis le bord gauche
    const newWidth = e.clientX;
    
    // Limiter entre min et max
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(clampedWidth);
    localStorage.setItem(storageKey, clampedWidth.toString());
  }, [isDragging, minWidth, maxWidth, storageKey]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
      
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isDragging, resize, stopResize]);

  return {
    width,
    isDragging,
    startResize,
    handlers: {
      onMouseDown: startResize
    }
  };
};

/**
 * Hook spécifique pour sidebar à gauche
 */
export const useResizableLeft = (storageKey, defaultWidth = 280, minWidth = 200, maxWidth = 400) => {
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved) : defaultWidth;
  });
  
  const [isDragging, setIsDragging] = useState(false);

  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback((e) => {
    if (!isDragging) return;

    const newWidth = e.clientX;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    setWidth(clampedWidth);
    localStorage.setItem(storageKey, clampedWidth.toString());
  }, [isDragging, minWidth, maxWidth, storageKey]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
      
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
      };
    }
  }, [isDragging, resize, stopResize]);

  return {
    width,
    isDragging,
    startResize,
    handlers: {
      onMouseDown: startResize
    }
  };
};