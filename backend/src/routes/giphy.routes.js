// routes/giphy.routes.js
const express = require('express');
const router = express.Router();
const giphyService = require('../services/giphyService');

/**
 * Routes pour l'intégration Giphy
 */

// GET /api/giphy/search - Rechercher des GIFs
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query parameter "q" is required' 
      });
    }
    
    const result = await giphyService.search(
      q,
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la recherche Giphy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/giphy/trending - GIFs trending
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await giphyService.trending(
      parseInt(limit),
      parseInt(offset)
    );
    
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des trending:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;