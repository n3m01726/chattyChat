// services/userService.js
const databaseService = require('./databaseService');

// Map des utilisateurs connectés (en mémoire)
// socketId -> { userId, username }
const connectedUsers = new Map();

/**
 * Service de gestion des utilisateurs (avec SQLite)
 */
class UserService {
  /**
   * Récupère ou crée un utilisateur dans la DB
   */
  getOrCreateUser(username) {
    const db = databaseService.getDb();
    
    // Chercher l'utilisateur existant
    let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    // Si n'existe pas, le créer
    if (!user) {
      const result = db.prepare(`
        INSERT INTO users (
          username, display_name, bio, pronouns, custom_color, 
          avatar_url, banner_url, status, status_text, timezone, 
          dark_mode, last_seen
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        username, 
        null,  // display_name
        null,  // bio
        null,  // pronouns
        null,  // custom_color
        null,  // avatar_url
        null,  // banner_url
        'online', // status
        null,  // status_text
        'UTC', // timezone
        0      // dark_mode
      );
      
      user = {
        id: result.lastInsertRowid,
        username: username,
        display_name: null,
        bio: null,
        pronouns: null,
        custom_color: null,
        avatar_url: null,
        banner_url: null,
        status: 'online',
        status_text: null,
        timezone: 'UTC',
        dark_mode: 0,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      };
      
      console.log(`👤 Nouvel utilisateur créé: ${username} (ID: ${user.id})`);
    } else {
      // Mettre à jour last_seen et status
      db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP, status = ? WHERE id = ?')
        .run('online', user.id);
    }
    
    return user;
  }

  /**
   * Ajoute un utilisateur connecté (socket)
   */
  addUser(socketId, username) {
    const user = this.getOrCreateUser(username);
    connectedUsers.set(socketId, {
      userId: user.id,
      username: user.username
    });
    return user;
  }

  /**
   * Récupère les infos d'un utilisateur connecté
   */
  getUser(socketId) {
    return connectedUsers.get(socketId);
  }

  /**
   * Récupère le pseudo d'un utilisateur connecté
   */
  getUsername(socketId) {
    const user = connectedUsers.get(socketId);
    return user ? user.username : 'Anonyme';
  }

  /**
   * Récupère l'ID DB d'un utilisateur connecté
   */
  getUserId(socketId) {
    const user = connectedUsers.get(socketId);
    return user ? user.userId : null;
  }

  /**
   * Supprime un utilisateur connecté
   */
  removeUser(socketId) {
    const user = connectedUsers.get(socketId);
    connectedUsers.delete(socketId);
    
    // Mettre le statut offline dans la DB
    if (user && user.userId) {
      const db = databaseService.getDb();
      db.prepare('UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?')
        .run('offline', user.userId);
    }
    
    return user ? user.username : null;
  }

  /**
   * Compte d'utilisateurs en ligne
   */
  getUserCount() {
    return connectedUsers.size;
  }

  /**
   * Liste de tous les utilisateurs en ligne
   */
  getAllUsers() {
    return Array.from(connectedUsers.values()).map(u => u.username);
  }

  /**
   * Vérifie si un utilisateur est connecté
   */
  userExists(socketId) {
    return connectedUsers.has(socketId);
  }

  /**
   * Récupère le profil complet d'un utilisateur depuis la DB
   */
  getUserProfile(username) {
    const db = databaseService.getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  /**
   * Met à jour le profil d'un utilisateur
   */
  updateUserProfile(username, data) {
    const db = databaseService.getDb();
    
    const {
      bio,
      display_name,
      pronouns,
      custom_color,
      avatar_url,
      banner_url,
      status,
      status_text,
      timezone,
      dark_mode
    } = data;
    
    // Construire la requête dynamiquement en fonction des champs fournis
    const updates = [];
    const values = [];
    
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (display_name !== undefined) {
      updates.push('display_name = ?');
      values.push(display_name);
    }
    if (pronouns !== undefined) {
      updates.push('pronouns = ?');
      values.push(pronouns);
    }
    if (custom_color !== undefined) {
      updates.push('custom_color = ?');
      values.push(custom_color);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }
    if (banner_url !== undefined) {
      updates.push('banner_url = ?');
      values.push(banner_url);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (status_text !== undefined) {
      updates.push('status_text = ?');
      values.push(status_text);
    }
    if (timezone !== undefined) {
      updates.push('timezone = ?');
      values.push(timezone);
    }
    if (dark_mode !== undefined) {
      updates.push('dark_mode = ?');
      values.push(dark_mode ? 1 : 0);
    }
    
    // Toujours mettre à jour last_seen
    updates.push('last_seen = CURRENT_TIMESTAMP');
    
    if (updates.length > 0) {
      values.push(username);
      const query = `UPDATE users SET ${updates.join(', ')} WHERE username = ?`;
      db.prepare(query).run(...values);
    }
    
    return this.getUserProfile(username);
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  getUserStats(username) {
    const db = databaseService.getDb();
    
    const user = this.getUserProfile(username);
    if (!user) return null;
    
    const messageCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE user_id = ?
    `).get(user.id);
    
    return {
      ...user,
      messageCount: messageCount.count
    };
  }

  /**
   * Liste tous les utilisateurs de la DB
   */
  getAllUsersFromDb() {
    const db = databaseService.getDb();
    return db.prepare('SELECT * FROM users ORDER BY last_seen DESC').all();
  }
}

module.exports = new UserService();