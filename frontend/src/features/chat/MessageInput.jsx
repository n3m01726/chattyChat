// components/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { GifPicker } from './GifPicker';
import { AttachmentUploader } from './AttachmentUploader';
import { MentionAutocomplete } from './MentionAutocomplete';
import { TYPING_TIMEOUT, MAX_MESSAGE_LENGTH } from '../../utils/constants';
import { Code, Image, ImagePlay, Send } from "lucide-react";

/**
 * Formulaire d'envoi de message avec options enrichies + autocomplete mentions
 */
export const MessageInput = ({ 
  onSendMessage, 
  onTyping, 
  onStopTyping,
  members = []
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [useMarkdown, setUseMarkdown] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const typingTimeoutRef = useRef(null);
  
  // États pour l'autocomplete des mentions
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState('');
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionStartPos, setMentionStartPos] = useState(null);
  
  const textareaRef = useRef(null);

  // Détecter les mentions dans le texte
  useEffect(() => {
    const text = inputMessage;
    const cursorPos = textareaRef.current?.selectionStart || 0;
    
    // Chercher le dernier @ avant le curseur
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // Vérifier qu'il n'y a pas d'espace entre @ et le curseur
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      if (!/\s/.test(textAfterAt)) {
        // Autocomplete actif
        setMentionSearchQuery(textAfterAt);
        setMentionStartPos(lastAtIndex);
        setMentionSelectedIndex(0);
        
        // Calculer la position du dropdown
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const rect = textarea.getBoundingClientRect();
          
          // Position approximative (au-dessus du textarea)
          setMentionPosition({
            top: rect.top - 10, // Au-dessus du textarea
            left: rect.left
          });
        }
        
        setShowMentionAutocomplete(true);
      } else {
        setShowMentionAutocomplete(false);
      }
    } else {
      setShowMentionAutocomplete(false);
    }
  }, [inputMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() && !attachment && !gifUrl) return;

    const messageData = {
      text: inputMessage.trim() || '',
      has_markdown: useMarkdown
    };

    if (attachment) {
      messageData.attachment_type = attachment.type;
      messageData.attachment_url = attachment.url;
      if (attachment.expiresIn) {
        messageData.expires_in = attachment.expiresIn;
      }
    }

    if (gifUrl) {
      messageData.gif_url = gifUrl;
    }

    onSendMessage(messageData);
    
    setInputMessage('');
    setAttachment(null);
    setGifUrl(null);
    setShowMentionAutocomplete(false);
    onStopTyping();
    clearTimeout(typingTimeoutRef.current);
  };

  const handleChange = (e) => {
    setInputMessage(e.target.value);

    if (!typingTimeoutRef.current) {
      onTyping();
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
      typingTimeoutRef.current = null;
    }, TYPING_TIMEOUT);
  };

  const handleGifSelect = (url) => {
    setGifUrl(url);
    setShowGifPicker(false);
  };

  const handleAttachmentReady = (attachmentData) => {
    setAttachment(attachmentData);
    setShowAttachmentUploader(false);
  };

  const handleMentionSelect = (username) => {
    if (mentionStartPos === null) return;
    
    // Remplacer @query par @username
    const before = inputMessage.substring(0, mentionStartPos);
    const after = inputMessage.substring(textareaRef.current.selectionStart);
    const newText = `${before}@${username} ${after}`;
    
    setInputMessage(newText);
    setShowMentionAutocomplete(false);
    
    // Remettre le focus sur le textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + username.length + 2; // +2 pour @ et espace
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Gérer l'autocomplete avec les flèches
    if (showMentionAutocomplete) {
      const filteredMembers = members.filter(member => {
        const displayName = (member.display_name).toLowerCase();
        const username = member.username.toLowerCase();
        const query = mentionSearchQuery.toLowerCase();
        return displayName.includes(query) || username.includes(query);
      });
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex(prev => 
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredMembers[mentionSelectedIndex]) {
          handleMentionSelect(filteredMembers[mentionSelectedIndex].username);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionAutocomplete(false);
      }
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <form className="input-toolbar" onSubmit={handleSubmit}>
        {(attachment || gifUrl) && (
          <div className="message-preview">
            {attachment && (
              <div className="preview-item">
                <span>📎 Fichier attaché</span>
                {attachment.expiresIn && (
                  <small>⏱️ Expire dans {attachment.expiresIn}h</small>
                )}
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="preview-remove"
                >
                  ✕
                </button>
              </div>
            )}
            {gifUrl && (
              <div className="preview-item preview-gif">
                <img src={gifUrl} alt="GIF" />
                <button
                  type="button"
                  onClick={() => setGifUrl(null)}
                  className="preview-remove"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        <div className="input-toolbar">
          <button
            type="button"
            className={`toolbar-btn ${useMarkdown ? 'active' : ''}`}
            onClick={() => setUseMarkdown(!useMarkdown)}
            title="Markdown (gras, italique, liens...)"
          >
            {useMarkdown ? '📝' : <Code size={20}/>}
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowGifPicker(true)}
            title="Ajouter un GIF"
          >
            <ImagePlay size={20} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowAttachmentUploader(true)}
            title="Ajouter une image/vidéo"
          >
            <Image size={20} />
          </button>
        </div>
        
        <textarea
          ref={textareaRef}
          id="message-input"
          className="input-toolbar__textarea"
          placeholder={useMarkdown ? "Message (Markdown activé)... Tapez @ pour mentionner" : "Écris ton message... Tapez @ pour mentionner"}
          value={inputMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          style={{
            resize: 'none',
            minHeight: '40px',
            maxHeight: '120px',
            overflow: 'auto'
          }}
        />
        
        <button 
          className="toolbar-btn" 
          type="submit" 
          disabled={!inputMessage.trim() && !attachment && !gifUrl}
        >
          <Send size={20} />
        </button>
      </form>

      {/* Autocomplete mentions */}
      {showMentionAutocomplete && (
        <MentionAutocomplete
          members={members}
          searchQuery={mentionSearchQuery}
          selectedIndex={mentionSelectedIndex}
          onSelect={handleMentionSelect}
          position={mentionPosition}
        />
      )}

      {/* Modals */}
      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}

      {showAttachmentUploader && (
        <AttachmentUploader
          onAttachmentReady={handleAttachmentReady}
          onClose={() => setShowAttachmentUploader(false)}
        />
      )}
    </>
  );
};