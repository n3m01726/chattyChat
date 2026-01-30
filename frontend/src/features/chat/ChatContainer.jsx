// components/ChatContainer.jsx
import React from 'react';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';

/**
 * Container principal du chat (composition des composants)
 * Header et Footer sont maintenant dans App.jsx
 */
export const ChatContainer = ({
  username,
  messages,
  typingUsers,
  onSendMessage,
  onTyping,
  onStopTyping,
  onUsernameClick,
  userProfile,
  onDeleteMessage,
  members = []
}) => {
  return (
    <div className="chat-container">
      <MessageList 
        messages={messages}
        currentUsername={username}
        onUsernameClick={onUsernameClick}
        userTimezone={userProfile?.timezone}
        onDeleteMessage={onDeleteMessage}
      />

      <TypingIndicator typingUsers={typingUsers} />

      <MessageInput 
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        members={members}
      />
    </div>
  );
};