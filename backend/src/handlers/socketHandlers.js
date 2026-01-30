// handlers/socketHandlers.js
const messageService = require('../services/messageService');
const userService = require('../services/userService');

/**
 * Configure tous les handlers Socket.io pour un socket donné
 */
function setupSocketHandlers(io, socket) {
  
  // Handler: un utilisateur rejoint
  socket.on('user:join', (username) => {
    const user = userService.addUser(socket.id, username);
    const displayName = user.display_name || user.username;
    console.log(`👤 ${displayName} a rejoint le chat (${socket.id})`);

    // Envoyer l'historique au nouvel arrivant
    socket.emit('messages:history', messageService.getAllMessages());

    // Notifier tout le monde avec le display name
    io.emit('user:joined', {
      username: displayName,
      userCount: userService.getUserCount()
    });
  });

  // Handler: réception d'un message (étendu avec mentions)
  socket.on('message:send', (data) => {
    const user = userService.getUser(socket.id);
    if (!user) {
      console.error('❌ Utilisateur non trouvé:', socket.id);
      return;
    }

    const {
      text,
      has_markdown = false,
      attachment_type = null,
      attachment_url = null,
      expires_in = null,
      gif_url = null
    } = data;

    // Calculer la date d'expiration si nécessaire
    let attachment_expires_at = null;
    if (expires_in && attachment_url) {
      const expiresDate = new Date();
      expiresDate.setHours(expiresDate.getHours() + expires_in);
      attachment_expires_at = expiresDate.toISOString();
    }

    const message = messageService.addMessage(user.userId, user.username, text, {
      has_markdown,
      attachment_type,
      attachment_url,
      attachment_expires_at,
      gif_url
    });

    const displayName = message.display_name || message.username;
    console.log(`💬 ${displayName}: ${text}${attachment_url ? ' [+attachment]' : ''}${gif_url ? ' [+gif]' : ''}${message.mentions.length > 0 ? ` [mentions: ${message.mentions.join(', ')}]` : ''}`);

    // Diffuser à tous les clients
    io.emit('message:received', message);

    // Si le message contient des mentions, envoyer des notifications
    if (message.mentions && message.mentions.length > 0) {
      message.mentions.forEach(mentionedUsername => {
        // Ne pas notifier l'auteur s'il se mentionne lui-même
        if (mentionedUsername !== user.username) {
          io.emit('mention:received', {
            messageId: message.id,
            mentionedUser: mentionedUsername,
            author: displayName,
            text: message.text,
            timestamp: message.timestamp
          });
        }
      });
    }
  });

  // Handler: indicateur "en train d'écrire"
  socket.on('user:typing', () => {
    const user = userService.getUser(socket.id);
    if (user) {
      const profile = userService.getUserProfile(user.username);
      const displayName = profile?.display_name || user.username;
      socket.broadcast.emit('user:typing', { username: displayName });
    }
  });

  socket.on('user:stop-typing', () => {
    const user = userService.getUser(socket.id);
    if (user) {
      const profile = userService.getUserProfile(user.username);
      const displayName = profile?.display_name || user.username;
      socket.broadcast.emit('user:stop-typing', { username: displayName });
    }
  });

  // Handler: suppression d'un message
  socket.on('message:delete', (data) => {
    const user = userService.getUser(socket.id);
    if (!user) {
      console.error('❌ Utilisateur non trouvé pour suppression');
      socket.emit('message:delete-error', { error: 'Utilisateur non trouvé' });
      return;
    }

    console.log(`🗑️  Tentative de suppression du message ${data.messageId} par ${user.username} (userId: ${user.userId})`);
    
    const result = messageService.deleteMessageByUser(parseInt(data.messageId), user.userId);
    
    if (result.success) {
      console.log(`✅ Message ${data.messageId} supprimé avec succès`);
      
      const deleteData = { messageId: parseInt(data.messageId) };
      console.log(`📤 Émission de message:deleted à tous les clients:`, deleteData);
      
      // Notifier tous les clients
      io.emit('message:deleted', deleteData);
    } else {
      console.error(`❌ Échec suppression: ${result.error}`);
      socket.emit('message:delete-error', result);
    }
  });

  // Handler: déconnexion
  socket.on('disconnect', () => {
    const username = userService.removeUser(socket.id);
    
    if (username && username !== 'Anonyme') {
      const profile = userService.getUserProfile(username);
      const displayName = profile?.display_name || username;
      
      console.log(`❌ ${displayName} s'est déconnecté`);

      io.emit('user:left', {
        username: displayName,
        userCount: userService.getUserCount()
      });
    }
  });
}

module.exports = { setupSocketHandlers };