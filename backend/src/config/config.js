// config/config.js

module.exports = {
    // Port du serveur
    PORT: process.env.PORT || 3001,
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    
    // Limites
    MAX_MESSAGE_HISTORY: 100,
    MAX_MESSAGE_LENGTH: 500,
    
    // Environnement
    NODE_ENV: process.env.NODE_ENV || 'development'
  };