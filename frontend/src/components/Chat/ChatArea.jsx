import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { WelcomeHero } from './WelcomeHero';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatArea() {
  const { currentChat, isStreaming } = useChat();
  const messagesEndRef = useRef(null);

  const messages = currentChat?.messages || [];
  const hasMessages = messages.length > 0;

  // Auto scroll to bottom when messages or stream changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  return (
    <div className="chat-container">
      {hasMessages ? (
        <div className="messages-list">
          {messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              message={msg}
              isStreamingLast={isStreaming && index === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <WelcomeHero />
      )}

      <ChatInput />
    </div>
  );
}
