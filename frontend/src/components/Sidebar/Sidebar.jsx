import React from 'react';
import { Plus, Database, Sparkles, Clock } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ChatListItem } from './ChatListItem';

export function Sidebar({ isCollapsed }) {
  const { chats, startNewChat, isLoadingChats, seedPastConversations } = useChat();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={startNewChat} title="Start new conversation">
          <Plus size={18} />
          {!isCollapsed && <span className="btn-text">New chat</span>}
        </button>
      </div>

      <div className="sidebar-history">
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span className="history-section-title">Past Chats (MongoDB)</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{chats.length}</span>
          </div>
        )}

        {isLoadingChats ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Clock size={16} className="typing-dot" style={{ margin: '0 auto 8px' }} />
            {!isCollapsed && <p>Loading MongoDB history...</p>}
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '16px 8px', textAlign: 'center' }}>
            {!isCollapsed && (
              <>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  No saved conversations yet in MongoDB.
                </p>
                <button
                  onClick={seedPastConversations}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--accent-blue)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  Seed Past Conversations
                </button>
              </>
            )}
          </div>
        ) : (
          chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} isCollapsed={isCollapsed} />
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            padding: '4px',
          }}
        >
          <Database size={14} color="#34a853" />
          {!isCollapsed && (
            <span>
              MongoDB Active • <strong style={{ color: 'var(--text-secondary)' }}>{chats.length}</strong> chats
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
