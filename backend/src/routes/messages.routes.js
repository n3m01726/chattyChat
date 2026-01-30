// routes/messages.routes.js
const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');
const userService = require('../services/userService');
const uploadService = require('../services/uploadService');

/**
 * Routes pour la gestion des messages
 */

// POST /api/messages/attachment - Upload attachment pour message
router.post('/attachment', uploadService.single('attachment'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Aucun fichier fourni' 
      });
    }
    
    const attachmentUrl = uploadService.getFileUrl(req.file.filename);
    
    // Déterminer le type (image ou vidéo)
    const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    res.json({
      success: true,
      attachmentUrl,
      type,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'attachment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/messages/search - Rechercher des messages
router.get('/search', (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query parameter "q" is required' 
      });
    }
    
    const messages = messageService.searchMessages(q, parseInt(limit) || 50);
    res.json({ success: true, messages, count: messages.length });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/messages/:messageId - Supprimer un message
router.delete('/:messageId', (req, res) => {
  try {
    const { messageId } = req.params;
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username requis' 
      });
    }
    
    // Récupérer l'userId
    const user = userService.getUserProfile(username);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }
    
    const result = messageService.deleteMessageByUser(
      parseInt(messageId),
      user.id
    );
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(403).json(result);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;