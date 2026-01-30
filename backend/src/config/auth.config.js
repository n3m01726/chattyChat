// config/auth.config.js

module.exports = {
    // JWT Secret (EN PRODUCTION: utiliser une variable d'environnement forte!)
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    
    // Durée de vie des tokens
    JWT_ACCESS_EXPIRATION: '15m',      // Access token: 15 minutes
    JWT_REFRESH_EXPIRATION: '7d',      // Refresh token: 7 jours
    
    // Bcrypt
    BCRYPT_ROUNDS: 12,                 // Plus c'est élevé, plus c'est sécurisé (mais lent)
    
    // Password requirements
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIRE_UPPERCASE: true,
    PASSWORD_REQUIRE_LOWERCASE: true,
    PASSWORD_REQUIRE_NUMBER: true,
    PASSWORD_REQUIRE_SPECIAL: false,   // !, @, #, $, etc.
    
    // Rate limiting
    LOGIN_RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    LOGIN_RATE_LIMIT_MAX_ATTEMPTS: 5,         // 5 tentatives max
    
    // Cookie settings
    COOKIE_HTTP_ONLY: true,            // Empêche JavaScript d'accéder au cookie
    COOKIE_SECURE: process.env.NODE_ENV === 'production', // HTTPS only en production
    COOKIE_SAME_SITE: 'strict',        // Protection CSRF
    
    // OAuth providers (pour Phase future)
    OAUTH_PROVIDERS: ['google', 'discord']
  };