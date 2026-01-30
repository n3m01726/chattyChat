// services/giphyService.js
const fetch = require('node-fetch');

/**
 * Service d'intégration Giphy
 * Note: Utilise l'API publique de Giphy avec clé limitée
 */
class GiphyService {
  constructor() {
    // Clé API publique Giphy (limitée, pour dev)
    // En prod, utiliser une vraie clé depuis https://developers.giphy.com/
    this.apiKey = process.env.GIPHY_API_KEY || 'YOUR_GIPHY_API_KEY';
    this.baseUrl = 'https://api.giphy.com/v1/gifs';
  }

  /**
   * Recherche des GIFs
   */
  async search(query, limit = 20, offset = 0) {
    try {
      const url = `${this.baseUrl}/search?api_key=${this.apiKey}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}&rating=g`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        return {
          success: true,
          gifs: data.data.map(gif => ({
            id: gif.id,
            title: gif.title,
            url: gif.images.fixed_height.url,
            preview: gif.images.fixed_height_small.url,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height
          }))
        };
      }
      
      return { success: false, gifs: [] };
    } catch (error) {
      console.error('Erreur Giphy search:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trending GIFs
   */
  async trending(limit = 20, offset = 0) {
    try {
      const url = `${this.baseUrl}/trending?api_key=${this.apiKey}&limit=${limit}&offset=${offset}&rating=g`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        return {
          success: true,
          gifs: data.data.map(gif => ({
            id: gif.id,
            title: gif.title,
            url: gif.images.fixed_height.url,
            preview: gif.images.fixed_height_small.url,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height
          }))
        };
      }
      
      return { success: false, gifs: [] };
    } catch (error) {
      console.error('Erreur Giphy trending:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère un GIF par ID
   */
  async getById(id) {
    try {
      const url = `${this.baseUrl}/${id}?api_key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        const gif = data.data;
        return {
          success: true,
          gif: {
            id: gif.id,
            title: gif.title,
            url: gif.images.fixed_height.url,
            preview: gif.images.fixed_height_small.url,
            width: gif.images.fixed_height.width,
            height: gif.images.fixed_height.height
          }
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Erreur Giphy getById:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GiphyService();