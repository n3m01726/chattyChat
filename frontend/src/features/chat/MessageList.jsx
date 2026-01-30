// components/MessageList.jsx
import React, { useEffect, useRef } from 'react';
import { Message } from './Message';

/**
 * Liste des messages avec auto-scroll
 */
export const MessageList = ({ messages, currentUsername, onUsernameClick, userTimezone, onDeleteMessage }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll vers le bas quand un nouveau message arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-container">
      {messages.map((msg) => (
        <Message 
          key={msg.id}
          message={msg}
          isOwn={msg.username === currentUsername}
          onUsernameClick={onUsernameClick}
          userTimezone={userTimezone}
          onDelete={onDeleteMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};