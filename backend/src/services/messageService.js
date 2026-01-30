// services/messageService.js
const databaseService = require('./databaseService');

/**
 * Service de gestion des messages (avec SQLite)
 */
class MessageService {
  /**
   * Extrait les mentions d'un texte (@username)
   * @param {string} text - Texte du message
   * @returns {Array<string>} - Liste des usernames mentionnés
   */
  extractMentions(text) {
    if (!text) return [];
    
    // Regex pour capturer @username (lettres, chiffres, underscore, tirets)
    const mentionRegex = /@([\w-]+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      if (!mentions.includes(username)) {
        mentions.push(username);
      }
    }
    
    return mentions;
  }

  /**
   * Valide que les mentions existent dans la base de données
   * @param {Array<string>} mentions - Usernames à valider
   * @returns {Array<string>} - Usernames valides
   */
  validateMentions(mentions) {
    if (!mentions || mentions.length === 0) return [];
    
    const db = databaseService.getDb();
    const validMentions = [];
    
    for (const username of mentions) {
      const user = db.prepare('SELECT username FROM users WHERE username = ?').get(username);
      if (user) {
        validMentions.push(username);
      }
    }
    
    return validMentions;
  }

  /**
   * Ajoute un nouveau message dans la DB
   */
  addMessage(userId, username, text, options = {}) {
    const db = databaseService.getDb();
    
    const {
      has_markdown = false,
      attachment_type = null,
      attachment_url = null,
      attachment_expires_at = null,
      gif_url = null
    } = options;
    
    // Extraire et valider les mentions
    const extractedMentions = this.extractMentions(text);
    const validMentions = this.validateMentions(extractedMentions);
    const mentionsJson = validMentions.length > 0 ? JSON.stringify(validMentions) : null;
    
    const result = db.prepare(`
      INSERT INTO messages (
        user_id, text, has_markdown, attachment_type, 
        attachment_url, attachment_expires_at, gif_url, mentions, created_at
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      userId, 
      text, 
      has_markdown ? 1 : 0, 
      attachment_type,
      attachment_url,
      attachment_expires_at,
      gif_url,
      mentionsJson
    );
    
    // Récupérer le message complet
    const message = db.prepare(`
      SELECT 
        m.id, 
        m.text,
        m.has_markdown,
        m.attachment_type,
        m.attachment_url,
        m.attachment_expires_at,
        m.gif_url,
        m.mentions,
        m.created_at as timestamp, 
        u.username,
        u.display_name,
        u.custom_color,
        u.avatar_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `).get(result.lastInsertRowid);
    
    // Parser les mentions JSON
    if (message.mentions) {
      try {
        message.mentions = JSON.parse(message.mentions);
      } catch (e) {
        message.mentions = [];
      }
    } else {
      message.mentions = [];
    }
    
    return message;
  }

  /**
   * Récupère tous les messages (avec limite)
   */
  getAllMessages(limit = 100) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT 
        m.id, 
        m.text,
        m.has_markdown,
        m.attachment_type,
        m.attachment_url,
        m.attachment_expires_at,
        m.gif_url,
        m.mentions,
        m.created_at as timestamp, 
        u.username,
        u.display_name,
        u.custom_color,
        u.avatar_url
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at ASC
      LIMIT ?
    `).all(limit);
    
    // Parser les mentions pour chaque message
    return messages.map(msg => {
      if (msg.mentions) {
        try {
          msg.mentions = JSON.parse(msg.mentions);
        } catch (e) {
          msg.mentions = [];
        }
      } else {
        msg.mentions = [];
      }
      return msg;
    });
  }

  /**
   * Récupère les N derniers messages
   */
  getRecentMessages(count = 50) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT m.id, m.text, m.mentions, m.created_at as timestamp, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(count);
    
    return messages.reverse().map(msg => {
      if (msg.mentions) {
        try {
          msg.mentions = JSON.parse(msg.mentions);
        } catch (e) {
          msg.mentions = [];
        }
      } else {
        msg.mentions = [];
      }
      return msg;
    });
  }

  /**
   * Récupère les messages d'un utilisateur spécifique
   */
  getUserMessages(username, limit = 50) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT m.id, m.text, m.mentions, m.created_at as timestamp, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE u.username = ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(username, limit);
    
    return messages.reverse().map(msg => {
      if (msg.mentions) {
        try {
          msg.mentions = JSON.parse(msg.mentions);
        } catch (e) {
          msg.mentions = [];
        }
      } else {
        msg.mentions = [];
      }
      return msg;
    });
  }

  /**
   * Recherche des messages par texte
   */
  searchMessages(query, limit = 50) {
    const db = databaseService.getDb();
    
    const messages = db.prepare(`
      SELECT m.id, m.text, m.mentions, m.created_at as timestamp, u.username
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.text LIKE ?
      ORDER BY m.created_at DESC
      LIMIT ?
    `).all(`%${query}%`, limit);
    
    return messages.reverse().map(msg => {
      if (msg.mentions) {
        try {
          msg.mentions = JSON.parse(msg.mentions);
        } catch (e) {
          msg.mentions = [];
        }
      } else {
        msg.mentions = [];
      }
      return msg;
    });
  }

  /**
   * Compte total de messages
   */
  getMessageCount() {
    const db = databaseService.getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM messages').get();
    return result.count;
  }

  /**
   * Supprime un message (pour modération)
   */
  deleteMessage(messageId) {
    const db = databaseService.getDb();
    
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
    
    if (message && message.attachment_url) {
      const uploadService = require('./uploadService');
      uploadService.deleteFile(message.attachment_url);
    }
    
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
    return result.changes > 0;
  }

  /**
   * Supprime un message si l'utilisateur en est propriétaire
   */
  deleteMessageByUser(messageId, userId) {
    const db = databaseService.getDb();
    
    const message = db.prepare('SELECT * FROM messages WHERE id = ? AND user_id = ?').get(messageId, userId);
    
    if (!message) {
      return { success: false, error: 'Message non trouvé ou non autorisé' };
    }
    
    if (message.attachment_url) {
      const uploadService = require('./uploadService');
      uploadService.deleteFile(message.attachment_url);
    }
    
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(messageId);
    return { success: result.changes > 0, messageId };
  }

  /**
   * Récupère les statistiques des messages
   */
  getStats() {
    const db = databaseService.getDb();
    
    const totalMessages = this.getMessageCount();
    
    const topUsers = db.prepare(`
      SELECT u.username, COUNT(*) as count
      FROM messages m
      JOIN users u ON m.user_id = u.id
      GROUP BY u.username
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    return {
      totalMessages,
      topUsers
    };
  }

  /**
   * Efface tous les messages (pour dev/test)
   */
  clearMessages() {
    const db = databaseService.getDb();
    db.prepare('DELETE FROM messages').run();
    console.log('🗑️  Tous les messages ont été supprimés');
  }

  /**
   * Nettoie les messages avec attachments expirés
   */
  cleanExpiredAttachments() {
    const db = databaseService.getDb();
    
    const expired = db.prepare(`
      SELECT id, attachment_url 
      FROM messages 
      WHERE attachment_expires_at IS NOT NULL 
      AND attachment_expires_at < CURRENT_TIMESTAMP
    `).all();
    
    if (expired.length === 0) return 0;
    
    const uploadService = require('./uploadService');
    for (const msg of expired) {
      if (msg.attachment_url) {
        uploadService.deleteFile(msg.attachment_url);
      }
    }
    
    const result = db.prepare(`
      UPDATE messages 
      SET attachment_type = NULL, 
          attachment_url = NULL, 
          attachment_expires_at = NULL
      WHERE attachment_expires_at IS NOT NULL 
      AND attachment_expires_at < CURRENT_TIMESTAMP
    `).run();
    
    console.log(`🗑️  ${result.changes} attachments expirés nettoyés`);
    return result.changes;
  }
}

module.exports = new MessageService();