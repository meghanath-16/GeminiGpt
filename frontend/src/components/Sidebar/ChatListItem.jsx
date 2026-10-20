import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function ChatListItem({ chat, isCollapsed }) {
  const { currentChatId, selectChat, deleteChatSession } = useChat();
  const isActive = currentChatId === chat.id;

  return (
    <div
      className={`chat-item ${isActive ? 'active' : ''}`}
      onClick={() => selectChat(chat.id)}
      title={chat.title}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
        <MessageSquare size={16} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
        {!isCollapsed && <span className="chat-item-text">{chat.title || 'Untitled Chat'}</span>}
      </div>

      {!isCollapsed && (
        <div className="chat-item-actions">
          <button
            className="icon-btn"
            style={{ padding: '4px', color: 'var(--text-muted)' }}
            onClick={(e) => deleteChatSession(chat.id, e)}
            title="Delete chat from MongoDB"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
