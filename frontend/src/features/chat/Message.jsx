// components/Message.jsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { formatTime, stringToColor } from '../../utils/formatters';
import { Avatar } from '../../components/Avatar';
import { SOCKET_URL } from '../../utils/constants';

/**
 * Composant pour afficher un message (normal ou système)
 */
export const Message = ({ 
  message, 
  isOwn, 
  onUsernameClick, 
  userTimezone, 
  onDelete,
  currentUsername 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Message système (connexion/déconnexion)
  if (message.system) {
    return (
      <div className="message message--system">
        <p className="message__text">{message.text}</p>
      </div>
    );
  }

  const handleDelete = () => {
    onDelete(message.id);
    setShowDeleteConfirm(false);
  };

  const userColor = message.custom_color || stringToColor(message.username);
  const displayName = message.display_name || message.username;
  
  const apiUrl = SOCKET_URL.replace(/:\d+$/, ':3001');
  const avatarUrl = message.avatar_url ? `${apiUrl}${message.avatar_url}` : null;

  const isExpired = message.attachment_expires_at && new Date(message.attachment_expires_at) < new Date();
  const attachmentUrl = message.attachment_url && !isExpired ? `${apiUrl}${message.attachment_url}` : null;

  // Vérifier si le message contient une mention de l'utilisateur actuel
  const isMentioned = message.mentions && 
    message.mentions.some(username => username === currentUsername);

  /**
   * Parse le texte pour rendre les @mentions cliquables
   */
  const parseTextWithMentions = (text) => {
    if (!text) return null;
    
    // Regex pour détecter @username
    const mentionRegex = /(@[\w-]+)/g;
    const parts = text.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        
        // Vérifier si c'est une mention valide
        const isValidMention = message.mentions && message.mentions.includes(username);
        
        if (isValidMention) {
          return (
            <span
              key={index}
              className="message__mention"
              onClick={(e) => {
                e.stopPropagation();
                onUsernameClick && onUsernameClick(username);
              }}
            >
              {part}
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div 
      id={`message-${message.id}`}
      className={`message ${isOwn ? 'message--own' : ''} ${isMentioned ? 'message--mentioned' : ''}`}
    >
      <div className="message__content">
        <div 
          className="avatar avatar--clickable" 
          onClick={() => onUsernameClick && onUsernameClick(message.username)}
        >
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={displayName} 
              className="avatar avatar--medium"
            />
          ) : (
            <Avatar username={message.username} size="small" clickable />
          )}
        </div>
        <div className="message__bubble">
          <div className="message__header">
            <span 
              className="message__username message__username--clickable" 
              style={{ color: userColor }}
              onClick={() => onUsernameClick && onUsernameClick(message.username)}
            >
              {displayName}
            </span>
            <span className="message__time">
              {formatTime(message.timestamp, userTimezone)}
            </span>
          </div>
          
          {/* Texte avec mentions ou markdown */}
          {message.text && (
            message.has_markdown ? (
              <div className="message__text message__markdown">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="message__text">
                {parseTextWithMentions(message.text)}
              </p>
            )
          )}

          {/* GIF */}
          {message.gif_url && (
            <div className="message__gif">
              <img src={message.gif_url} alt="GIF" />
            </div>
          )}

          {/* Attachment (image/vidéo) */}
          {attachmentUrl && (
            <div className="message__attachment">
              {message.attachment_type === 'image' ? (
                <img src={attachmentUrl} alt="Attachment" />
              ) : (
                <video src={attachmentUrl} controls />
              )}
              {message.attachment_expires_at && (
                <small className="message__attachment-expires">
                  ⏱️ Expire le {new Date(message.attachment_expires_at).toLocaleString('fr-FR')}
                </small>
              )}
            </div>
          )}

          {isExpired && message.attachment_url && (
            <div className="message__attachment-expired">
              📎 Fichier expiré et supprimé
            </div>
          )}

          {/* Bouton supprimer */}
          {isOwn && (
            <div className="message__actions">
              {!showDeleteConfirm ? (
                <button
                  className="message-actions__delete"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Supprimer ce message"
                >
                  🗑️
                </button>
              ) : (
                <div className="message-actions__delete-confirm">
                  <span>Supprimer ?</span>
                  <button
                    className="message-actions__confirm"
                    onClick={handleDelete}
                  >
                    ✓
                  </button>
                  <button
                    className="message-actions__cancel"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};