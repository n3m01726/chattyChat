// routes/users.routes.js
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const uploadService = require('../services/uploadService');

/**
 * Routes pour la gestion des utilisateurs
 */

// GET /api/users - Liste tous les utilisateurs
router.get('/', (req, res) => {
  try {
    const users = userService.getAllUsersFromDb();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:username - Profil d'un utilisateur
router.get('/:username', (req, res) => {
  try {
    const { username } = req.params;
    const profile = userService.getUserStats(username);
    
    if (!profile) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:username - Mettre à jour le profil
router.put('/:username', (req, res) => {
  try {
    const { username } = req.params;
    const profileData = req.body;
    
    // Si avatar_url ou banner_url est explicitement null, supprimer le fichier
    if (profileData.avatar_url === null) {
      const currentProfile = userService.getUserProfile(username);
      if (currentProfile?.avatar_url) {
        uploadService.deleteFile(currentProfile.avatar_url);
      }
    }
    
    if (profileData.banner_url === null) {
      const currentProfile = userService.getUserProfile(username);
      if (currentProfile?.banner_url) {
        uploadService.deleteFile(currentProfile.banner_url);
      }
    }
    
    const profile = userService.updateUserProfile(username, profileData);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:username/avatar - Upload avatar
router.post('/:username/avatar', uploadService.single('avatar'), (req, res) => {
  try {
    const { username } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun fichier fourni' 
      });
    }
    
    // Récupérer l'ancien avatar pour le supprimer
    const currentProfile = userService.getUserProfile(username);
    const avatarUrl = uploadService.replaceFile(
      currentProfile?.avatar_url,
      req.file.filename
    );

    // Mettre à jour le profil
    const profile = userService.updateUserProfile(username, { 
      avatar_url: avatarUrl 
    });
    
    res.json({ success: true, profile, avatarUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:username/banner - Upload banner
router.post('/:username/banner', uploadService.single('banner'), (req, res) => {
  try {
    const { username } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun fichier fourni' 
      });
    }
    
    // Récupérer l'ancien banner pour le supprimer
    const currentProfile = userService.getUserProfile(username);
    const bannerUrl = uploadService.replaceFile(
      currentProfile?.banner_url,
      req.file.filename
    );
    
    // Mettre à jour le profil
    const profile = userService.updateUserProfile(username, { 
      banner_url: bannerUrl 
    });
    
    res.json({ success: true, profile, bannerUrl });
  } catch (error) {
    console.error('Erreur lors de l\'upload du banner:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:username/messages - Messages d'un utilisateur
router.get('/:username/messages', (req, res) => {
  try {
    const { username } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const messageService = require('../services/messageService');
    const messages = messageService.getUserMessages(username, limit);
    
    res.json({ success: true, messages, count: messages.length });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;