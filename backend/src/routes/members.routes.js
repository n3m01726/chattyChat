// routes/members.routes.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

/**
 * Routes pour la liste des membres
 */

// GET /api/members - Liste tous les membres avec leurs stats
router.get('/', (req, res) => {
  try {
    const users = userService.getAllUsersFromDb();
    
    // Enrichir avec le nombre de messages
    const membersWithStats = users.map(user => {
      const stats = userService.getUserStats(user.username);
      return {
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        status: user.status || 'online',
        status_text: user.status_text,
        custom_color: user.custom_color,
        messageCount: stats?.messageCount || 0,
        last_seen: user.last_seen
      };
    });
    
    // Trier par last_seen (plus récent en premier)
    membersWithStats.sort((a, b) => 
      new Date(b.last_seen) - new Date(a.last_seen)
    );
    
    res.json({ 
      success: true, 
      members: membersWithStats, 
      count: membersWithStats.length 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;