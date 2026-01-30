console.log('🔥 DEBUT DU FICHIER useSocket.js');

// hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

console.log('📦 Module useSocket chargé, SOCKET_URL:', SOCKET_URL);

// Instance Socket.io partagée (singleton)
let socket = null;

/**
 * Hook pour gérer la connexion Socket.io et les événements du chat
 */
export const useSocket = () => {
  console.log('🚀 useSocket hook appelé - DEBUT');
  
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [mentions, setMentions] = useState([]);

  // Initialiser la connexion Socket.io une seule fois
  useEffect(() => {
    console.log('🔧 useEffect de useSocket exécuté');
    
    if (!socket) {
      socket = io(SOCKET_URL);
      console.log('🔌 Socket.io initialisé vers', SOCKET_URL);
    }

    // Vérifier la connexion
    socket.on('connect', () => {
      console.log('✅ Socket connecté, ID:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
    });

    // Événement: réception de l'historique
    socket.on('messages:history', (history) => {
      console.log('📜 Historique reçu:', history.length, 'messages');
      setMessages(history);
    });

    // Événement: nouveau message
    socket.on('message:received', (message) => {
      console.log('📨 Nouveau message reçu:', message.id);
      setMessages(prev => [...prev, message]);
    });

    // Événement: mention reçue
    socket.on('mention:received', (mentionData) => {
      console.log('📢 Mention reçue:', mentionData);
      
      // Ajouter la mention à la liste avec un ID unique
      setMentions(prev => [
        ...prev,
        {
          id: `${mentionData.messageId}-${Date.now()}`,
          ...mentionData
        }
      ]);
    });

    // Suppression d'un message
    socket.on('message:deleted', (data) => {
      console.log('📥 ===== MESSAGE DELETED EVENT RECU =====');
      console.log('📥 Data:', data);
      console.log('📥 Type de messageId:', typeof data.messageId, 'Valeur:', data.messageId);
      
      setMessages(prev => {
        console.log('📥 Messages avant filtrage:', prev.length);
        console.log('📥 IDs des messages:', prev.map(m => m.id));
        
        const filtered = prev.filter(msg => {
          const keep = msg.id !== data.messageId;
          if (!keep) {
            console.log('🗑️ ===== SUPPRESSION DU MESSAGE', msg.id, '=====');
          }
          return keep;
        });
        
        console.log('📥 Messages après filtrage:', filtered.length);
        return filtered;
      });
    });

    // Un utilisateur a rejoint
    socket.on('user:joined', (data) => {
      setUserCount(data.userCount);
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        system: true,
        text: `${data.username} a rejoint le chat`
      }]);
    });

    // Un utilisateur est parti
    socket.on('user:left', (data) => {
      setUserCount(data.userCount);
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        system: true,
        text: `${data.username} a quitté le chat`
      }]);
    });

    // Événement: quelqu'un tape
    socket.on('user:typing', (data) => {
      setTypingUsers(prev => new Set([...prev, data.username]));
    });

    // Événement: quelqu'un arrête de taper
    socket.on('user:stop-typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.username);
        return newSet;
      });
    });

    // Nettoyage
    return () => {
      socket.off('messages:history');
      socket.off('message:received');
      socket.off('message:deleted');
      socket.off('mention:received');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('user:typing');
      socket.off('user:stop-typing');
    };
  }, []);

  // Méthodes pour interagir avec le socket
  const joinChat = (username) => {
    console.log('📤 Envoi user:join pour', username);
    socket.emit('user:join', username);
  };

  const sendMessage = (messageData) => {
    console.log('📤 Envoi message:send', messageData);
    socket.emit('message:send', messageData);
  };

  const emitTyping = () => {
    socket.emit('user:typing');
  };

  const emitStopTyping = () => {
    socket.emit('user:stop-typing');
  };

  const deleteMessage = (messageId) => {
    console.log('📤 ===== ENVOI DELETE MESSAGE =====');
    console.log('📤 MessageId:', messageId, 'Type:', typeof messageId);
    socket.emit('message:delete', { messageId });
  };

  const removeMention = (mentionId) => {
    setMentions(prev => prev.filter(m => m.id !== mentionId));
  };

  console.log('🚀 useSocket hook - FIN, retourne les méthodes');

  return {
    messages,
    userCount,
    typingUsers,
    mentions,
    joinChat,
    sendMessage,
    emitTyping,
    emitStopTyping,
    deleteMessage,
    removeMention
  };
};