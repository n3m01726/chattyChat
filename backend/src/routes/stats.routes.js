// routes/stats.routes.js
const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const userService = require('../services/userService');

/**
 * Routes pour les statistiques globales
 */

// GET /api/stats - Statistiques globales
router.get('/', (req, res) => {
  try {
    const messageStats = messageService.getStats();
    const userCount = userService.getAllUsersFromDb().length;
    const onlineCount = userService.getUserCount();
    
    res.json({
      success: true,
      stats: {
        totalUsers: userCount,
        onlineUsers: onlineCount,
        totalMessages: messageStats.totalMessages,
        topUsers: messageStats.topUsers,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;