// middleware/authMiddleware.js
const authService = require('../services/authService');

/**
 * Middleware pour vérifier l'authentification JWT
 */
const requireAuth = (req, res, next) => {
  try {
    // Récupérer le token depuis le cookie ou le header Authorization
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Non authentifié' 
      });
    }
    
    // Vérifier le token
    const payload = authService.verifyToken(token);
    if (!payload || payload.type !== 'access') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token invalide' 
      });
    }
    
    // Vérifier que l'utilisateur existe toujours
    const user = authService.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Utilisateur introuvable' 
      });
    }
    
    // Ajouter les infos utilisateur à la requête
    req.user = {
      id: payload.userId,
      username: payload.username,
      email: payload.email
    };
    
    next();
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Erreur d\'authentification' 
    });
  }
};

/**
 * Middleware optionnel : ajoute les infos user si authentifié, sinon continue
 */
const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (token) {
      const payload = authService.verifyToken(token);
      if (payload && payload.type === 'access') {
        const user = authService.getUserById(payload.userId);
        if (user) {
          req.user = {
            id: payload.userId,
            username: payload.username,
            email: payload.email
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans user
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};