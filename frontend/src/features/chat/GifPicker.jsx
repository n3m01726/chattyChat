// components/GifPicker.jsx
import React, { useState, useEffect } from 'react';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Sélecteur de GIF via Giphy
 */
export const GifPicker = ({ onSelect, onClose }) => {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState('trending');

  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/giphy/trending?limit=20`);
      const data = await response.json();
      if (data.success) {
        setGifs(data.gifs);
        setMode('trending');
      }
    } catch (error) {
      console.error('Erreur chargement trending:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/giphy/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await response.json();
      if (data.success) {
        setGifs(data.gifs);
        setMode('search');
      }
    } catch (error) {
      console.error('Erreur recherche GIF:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGifClick = (gif) => {
    onSelect(gif.url);
    onClose();
  };

  return (
    <div className="gif-picker__overlay" onClick={onClose}>
      <div className="gif-picker__modal" onClick={(e) => e.stopPropagation()}>
        <div className="gif-picker__header">
          <h3>🎬 Choisir un GIF</h3>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <form className="gif-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Rechercher un GIF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button type="submit">🔍</button>
          <button type="button" onClick={loadTrending}>🔥 Trending</button>
        </form>

        <div className="gif-grid">
          {loading ? (
            <div className="gif-loading">Chargement...</div>
          ) : gifs.length > 0 ? (
            gifs.map((gif) => (
              <div
                key={gif.id}
                className="gif-item"
                onClick={() => handleGifClick(gif)}
              >
                <img src={gif.preview} alt={gif.title} />
              </div>
            ))
          ) : (
            <div className="gif-empty">Aucun GIF trouvé</div>
          )}
        </div>

        <div className="gif-picker__footer">
          <small>Powered by Giphy</small>
        </div>
      </div>
    </div>
  );
};