// services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const databaseService = require('./databaseService');
const authConfig = require('../config/auth.config');

/**
 * Service d'authentification
 */
class AuthService {
  
  /**
   * Valider un mot de passe selon les règles de sécurité
   */
  validatePassword(password) {
    const errors = [];
    
    if (password.length < authConfig.PASSWORD_MIN_LENGTH) {
      errors.push(`Le mot de passe doit contenir au moins ${authConfig.PASSWORD_MIN_LENGTH} caractères`);
    }
    
    if (authConfig.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (authConfig.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (authConfig.PASSWORD_REQUIRE_NUMBER && !/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (authConfig.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Valider un email
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Hasher un mot de passe
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, authConfig.BCRYPT_ROUNDS);
  }
  
  /**
   * Comparer un mot de passe avec son hash
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
  
  /**
   * Générer un access token JWT
   */
  generateAccessToken(userId, username, email) {
    return jwt.sign(
      { userId, username, email, type: 'access' },
      authConfig.JWT_SECRET,
      { expiresIn: authConfig.JWT_ACCESS_EXPIRATION }
    );
  }
  
  /**
   * Générer un refresh token JWT
   */
  generateRefreshToken(userId, username, email) {
    return jwt.sign(
      { userId, username, email, type: 'refresh' },
      authConfig.JWT_SECRET,
      { expiresIn: authConfig.JWT_REFRESH_EXPIRATION }
    );
  }
  
  /**
   * Vérifier un token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, authConfig.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Enregistrer un nouvel utilisateur
   */
  async register(username, email, password) {
    const db = databaseService.db;
    
    if (!db) throw new Error('Database not initialized');
    
    // Valider l'email
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Email invalide' };
    }
    
    // Valider le mot de passe
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, errors: passwordValidation.errors };
    }
    
    // Vérifier si l'email existe déjà
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }
    
    // Vérifier si le username existe déjà
    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUsername) {
      return { success: false, error: 'Ce nom d\'utilisateur est déjà pris' };
    }
    
    // Hasher le mot de passe
    const passwordHash = await this.hashPassword(password);
    
    // Créer l'utilisateur
    const result = db.prepare(`
      INSERT INTO users (
        username, email, password_hash, auth_provider, 
        created_at, last_seen
      ) 
      VALUES (?, ?, ?, 'local', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(username, email, passwordHash);
    
    const userId = result.lastInsertRowid;
    
    console.log(`👤 Nouvel utilisateur enregistré: ${username} (${email})`);
    
    return {
      success: true,
      user: {
        id: userId,
        username,
        email
      }
    };
  }
  
  /**
   * Connexion d'un utilisateur
   */
  async login(email, password) {
    const db = databaseService.db;
    
    if (!db) throw new Error('Database not initialized');
    
    // Récupérer l'utilisateur par email
    const user = db.prepare(`
      SELECT id, username, email, password_hash, auth_provider 
      FROM users 
      WHERE email = ?
    `).get(email);
    
    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
    
    // Vérifier que c'est un compte local (pas OAuth)
    if (user.auth_provider !== 'local') {
      return { 
        success: false, 
        error: `Ce compte utilise l'authentification ${user.auth_provider}` 
      };
    }

    if (user.is_suspended) {
      db.prepare(`
        UPDATE users
        SET is_suspended = 0, suspended_at = NULL
        WHERE id = ?
      `).run(user.id);
    }
    
    if (user.is_suspended) {
  await unsuspendUser(user.id);
}

    // Vérifier le mot de passe
    const passwordMatch = await this.comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }
    
    // Générer les tokens
    const accessToken = this.generateAccessToken(user.id, user.username, user.email);
    const refreshToken = this.generateRefreshToken(user.id, user.username, user.email);
    
    // Sauvegarder le refresh token en DB
    db.prepare(`
      UPDATE users 
      SET refresh_token = ?, last_login = CURRENT_TIMESTAMP, status = 'online'
      WHERE id = ?
    `).run(refreshToken, user.id);
    
    console.log(`✅ Connexion réussie: ${user.username} (${user.email})`);
    
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Rafraîchir un access token avec un refresh token
   */
  async refreshAccessToken(refreshToken) {
    const db = databaseService.db;
    
    if (!db) throw new Error('Database not initialized');
    
    // Vérifier le refresh token
    const payload = this.verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return { success: false, error: 'Token invalide' };
    }
    
    // Vérifier que le token existe en DB
    const user = db.prepare(`
      SELECT id, username, email, refresh_token 
      FROM users 
      WHERE id = ? AND refresh_token = ?
    `).get(payload.userId, refreshToken);
    
    if (!user) {
      return { success: false, error: 'Token invalide' };
    }
    
    // Générer un nouveau access token
    const newAccessToken = this.generateAccessToken(user.id, user.username, user.email);
    
    return {
      success: true,
      accessToken: newAccessToken
    };
  }
  
  /**
   * Déconnexion (invalider le refresh token)
   */
  logout(userId) {
    const db = databaseService.db;
    
    if (!db) throw new Error('Database not initialized');
    
    db.prepare(`
      UPDATE users 
      SET refresh_token = NULL, status = 'offline'
      WHERE id = ?
    `).run(userId);
    
    console.log(`👋 Déconnexion: userId ${userId}`);
    
    return { success: true };
  }
  
  /**
   * Récupérer un utilisateur par son ID (pour vérification token)
   */
  getUserById(userId) {
    const db = databaseService.db;
    
    if (!db) throw new Error('Database not initialized');
    
    return db.prepare(`
      SELECT id, username, email, auth_provider 
      FROM users 
      WHERE id = ? AND is_suspended = 0
    `).get(userId);
  }

async completeProfile(userId, email, password) {
  const db = databaseService.db;

  if (!this.validateEmail(email)) {
    return { success: false, error: 'Email invalide' };
  }

  const passwordValidation = this.validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, errors: passwordValidation.errors };
  }

  const user = db.prepare(`
    SELECT email, password_hash 
    FROM users 
    WHERE id = ?
  `).get(userId);

  if (!user) {
    return { success: false, error: 'Utilisateur introuvable' };
  }

  if (user.email || user.password_hash) {
    return { success: false, error: 'Compte déjà complété' };
  }

  const existingEmail = db.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).get(email);

  if (existingEmail) {
    return { success: false, error: 'Email déjà utilisé' };
  }

  const hash = await this.hashPassword(password);

  db.prepare(`
    UPDATE users
    SET email = ?, password_hash = ?, last_login = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(email, hash, userId);

  return { success: true };
} 
async updateCredentials(userId, currentPassword, { email, newPassword }) {
  const db = databaseService.db;

  const user = db.prepare(`
    SELECT password_hash, email 
    FROM users 
    WHERE id = ?
  `).get(userId);

  if (!user || !user.password_hash) {
    return { success: false, error: 'Compte incomplet' };
  }

  const valid = await this.comparePassword(currentPassword, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Mot de passe incorrect' };
  }

  if (email) {
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Email invalide' };
    }

    const used = db.prepare(
      'SELECT id FROM users WHERE email = ? AND id != ?'
    ).get(email, userId);

    if (used) {
      return { success: false, error: 'Email déjà utilisé' };
    }
  }

  let passwordHash = null;
  if (newPassword) {
    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
    passwordHash = await this.hashPassword(newPassword);
  }

  db.prepare(`
    UPDATE users SET
      email = COALESCE(?, email),
      password_hash = COALESCE(?, password_hash)
    WHERE id = ?
  `).run(email || null, passwordHash, userId);

  return { success: true };
}
async deleteAccount(userId, password) {
  const db = databaseService.db;

  const user = db.prepare(`
    SELECT password_hash 
    FROM users 
    WHERE id = ?
  `).get(userId);

  if (!user || !user.password_hash) {
    return { success: false, error: 'Mot de passe requis' };
  }

  const valid = await this.comparePassword(password, user.password_hash);
  if (!valid) {
    return { success: false, error: 'Mot de passe incorrect' };
  }

  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);

  return { success: true };
}

}
  module.exports = new AuthService();