import React, { useState } from 'react';
import { X, Database, Sliders, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function SettingsModal({ isOpen, onClose }) {
  const {
    systemInstruction,
    updateSystemInstruction,
    chats,
    seedPastConversations,
    clearAllHistory,
  } = useChat();

  const [localInstruction, setLocalInstruction] = useState(systemInstruction);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSystemInstruction(localInstruction);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedPastConversations();
    setIsSeeding(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="#a8c7fa" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Settings & Database</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* MongoDB Status Box */}
          <div
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} color="#34a853" />
                <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>MongoDB Database</span>
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#34a853',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={14} /> Connected
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Target: <code style={{ color: 'var(--accent-blue)' }}>mongodb://127.0.0.1:27017/sigmagpt</code>
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Currently storing <strong>{chats.length}</strong> conversation sessions with past messages.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} className={isSeeding ? 'typing-dot' : ''} />
                {isSeeding ? 'Seeding...' : 'Seed Past Historical Data'}
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all chats from MongoDB?')) {
                    clearAllHistory();
                  }
                }}
                style={{
                  background: 'rgba(234, 67, 53, 0.12)',
                  border: '1px solid rgba(234, 67, 53, 0.3)',
                  color: '#ea4335',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={14} />
                Clear All Chats
              </button>
            </div>
          </div>

          {/* System Instruction (Persona) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              System Persona / Instruction
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Guide Gemini's tone, personality, or role for upcoming conversations (e.g., "You are an elite Senior Staff Fullstack Engineer").
            </p>
            <textarea
              value={localInstruction}
              onChange={(e) => setLocalInstruction(e.target.value)}
              placeholder="e.g., You are an expert AI software architect. Respond with high precision and concise code."
              rows={4}
              style={{
                width: '100%',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)',
                fontSize: '0.88rem',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                onClick={handleSave}
                style={{
                  background: 'var(--accent-blue)',
                  color: '#131314',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {saveSuccess ? 'Saved! ✓' : 'Save Instructions'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
