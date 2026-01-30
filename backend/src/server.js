// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ← NOUVEAU
const cron = require('node-cron');

const config = require('./config/config');
const databaseService = require('./services/databaseService');
const { setupSocketHandlers } = require('./handlers/socketHandlers');
const messageService = require('./services/messageService');
const userService = require('./services/userService');
const apiRoutes = require('./routes/api');

// Initialiser la base de données
databaseService.init();

// Initialisation Express
const app = express();
const httpServer = createServer(app);

// Configuration Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true // ← IMPORTANT pour les cookies
  }
});

// Middleware Express
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true // ← IMPORTANT pour les cookies
}));
app.use(express.json());
app.use(cookieParser()); // ← NOUVEAU

// Servir les fichiers uploadés statiquement
app.use('/uploads', express.static('uploads'));

// Routes API
app.use('/api', apiRoutes);

// Routes de monitoring (existantes)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: config.NODE_ENV,
    users: userService.getUserCount(),
    messages: messageService.getMessageCount()
  });
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log(`✅ Nouvelle connexion: ${socket.id}`);
  
  // Configurer tous les handlers pour ce socket
  setupSocketHandlers(io, socket);
});

// Démarrage du serveur
httpServer.listen(config.PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${config.PORT}`);
  console.log(`📡 Socket.io prêt (CORS: ${config.CORS_ORIGIN})`);
  console.log(`🔧 Environnement: ${config.NODE_ENV}`);
  console.log(`📦 Base de données: SQLite (data/chat.db)`);
  console.log(`🔐 Authentification: JWT activée`);
});

// Tâche cron : nettoyer les attachments expirés toutes les heures
cron.schedule('0 * * * *', () => {
  console.log('🧹 Nettoyage des attachments expirés...');
  messageService.cleanExpiredAttachments();
});

// Fermer proprement la base de données à l'arrêt du serveur
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  databaseService.close();
  process.exit(0);
});