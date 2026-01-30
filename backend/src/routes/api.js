// routes/api.js
const express = require('express');
const router = express.Router();

/**
 * Point d'entrée principal des routes API
 * Délègue aux sous-routers modulaires
 */

// Import des sous-routers
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const messagesRoutes = require('./messages.routes');
const giphyRoutes = require('./giphy.routes');
const membersRoutes = require('./members.routes');
const statsRoutes = require('./stats.routes');

// Montage des routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/messages', messagesRoutes);
router.use('/giphy', giphyRoutes);
router.use('/members', membersRoutes);
router.use('/stats', statsRoutes);

// Route de santé (health check)
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;