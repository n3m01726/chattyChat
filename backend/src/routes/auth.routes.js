// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authService = require('../services/authService');
const authConfig = require('../config/auth.config');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * Rate limiter pour les tentatives de login
 */
const loginLimiter = rateLimit({
  windowMs: authConfig.LOGIN_RATE_LIMIT_WINDOW,
  max: authConfig.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  message: { 
    success: false, 
    error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/register - Inscription
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation des champs
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tous les champs sont requis' 
      });
    }
    
    // Enregistrer l'utilisateur
    const result = await authService.register(username, email, password);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'inscription' 
    });
  }
});

/**
 * POST /api/auth/login - Connexion
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    
    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email et mot de passe requis' 
      });
    }
    
    // Connexion
    const result = await authService.login(email, password);
    
    if (!result.success) {
      return res.status(401).json(result);
    }
    
    // Définir les cookies
    const cookieOptions = {
      httpOnly: authConfig.COOKIE_HTTP_ONLY,
      secure: authConfig.COOKIE_SECURE,
      sameSite: authConfig.COOKIE_SAME_SITE
    };
    
    // Access token (courte durée)
    res.cookie('accessToken', result.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    // Refresh token (longue durée si "remember me")
    if (rememberMe) {
      res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });
    }
    
    // Sauvegarder le dernier email dans un cookie séparé (non httpOnly)
    res.cookie('lastEmail', email, {
      secure: authConfig.COOKIE_SECURE,
      sameSite: authConfig.COOKIE_SAME_SITE,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });
    
    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la connexion' 
    });
  }
});

/**
 * POST /api/auth/refresh - Rafraîchir l'access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Refresh token manquant' 
      });
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    if (!result.success) {
      // Supprimer les cookies invalides
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json(result);
    }
    
    // Définir le nouveau access token
    res.cookie('accessToken', result.accessToken, {
      httpOnly: authConfig.COOKIE_HTTP_ONLY,
      secure: authConfig.COOKIE_SECURE,
      sameSite: authConfig.COOKIE_SAME_SITE,
      maxAge: 15 * 60 * 1000
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors du refresh:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors du refresh' 
    });
  }
});

/**
 * POST /api/auth/logout - Déconnexion
 */
router.post('/logout', requireAuth, (req, res) => {
  try {
    authService.logout(req.user.id);
    
    // Supprimer les cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur serveur lors de la déconnexion' 
    });
  }
});

/**
 * GET /api/auth/me - Récupérer l'utilisateur connecté
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * OAuth Placeholders (pour Phase future)
 */

// GET /api/auth/google - Connexion Google (TODO)
router.get('/google', (req, res) => {
  res.status(501).json({ 
    success: false, 
    error: 'Authentification Google à venir prochainement' 
  });
});

// GET /api/auth/discord - Connexion Discord (TODO)
router.get('/discord', (req, res) => {
  res.status(501).json({ 
    success: false, 
    error: 'Authentification Discord à venir prochainement' 
  });
});

/**
 * PATCH /api/auth/complete-profile
 * Ajouter email + password à un compte existant
 */
router.patch('/complete-profile', requireAuth, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    const result = await authService.completeProfile(
      req.user.id,
      email,
      password
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});
/**
 * PATCH /api/auth/update-credentials
 */
router.patch('/update-credentials', requireAuth, async (req, res) => {
  try {
    const { currentPassword, email, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel requis'
      });
    }

    const result = await authService.updateCredentials(
      req.user.id,
      currentPassword,
      { email, newPassword }
    );

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});
/**
 * DELETE /api/auth/me
 */
router.delete('/me', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    const result = await authService.deleteAccount(
      req.user.id,
      password
    );

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});
/**
 * POST /api/auth/suspend
 */
router.post('/suspend', requireAuth, async (req, res) => {
  try {
    await authService.suspendAccount(req.user.id);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
});



module.exports = router;