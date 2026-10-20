import React, { useState } from 'react';
import { X, Check, Zap, Sparkles, Image, Brain } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function ModelSelectorModal({ isOpen, onClose }) {
  const { availableModels, activeModel, updateActiveModel } = useChat();
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const filteredModels = availableModels.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'high-quota') return m.category.includes('High Quota') || m.category.includes('Massive');
    if (activeTab === 'flagship') return m.category.includes('Flagship') || m.category.includes('Reasoning');
    if (activeTab === 'image') return m.category.includes('Image');
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#a8c7fa" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Google Gemini Models</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderBottom: '1px solid var(--border-light)', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All Models' },
            { id: 'high-quota', label: 'High Quota (500-14.4K)' },
            { id: 'flagship', label: 'Flagship & Logic' },
            { id: 'image', label: 'Text-to-Image' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                border: activeTab === tab.id ? '1px solid var(--accent-blue)' : '1px solid transparent',
                color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          <div className="model-grid">
            {filteredModels.map((model) => {
              const isSelected = activeModel === model.id;
              return (
                <div
                  key={model.id}
                  className={`model-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    updateActiveModel(model.id);
                    onClose();
                  }}
                >
                  <div className="model-header-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{model.name}</span>
                      {model.badge && (
                        <span
                          className={`badge-pill ${
                            model.rpd === '500' ? 'quota-high' : model.rpd === '14.4K' ? 'quota-massive' : ''
                          }`}
                        >
                          {model.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check size={18} color="var(--accent-blue)" />}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {model.description}
                  </p>

                  <div className="model-specs">
                    <span>⚡ {model.rpm} RPM</span>
                    <span>•</span>
                    <span>📊 {model.tpm} TPM</span>
                    <span>•</span>
                    <span>🎯 {model.rpd} RPD</span>
                  </div>

                  {model.capabilities && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {model.capabilities.map((cap, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.72rem',
                            background: 'var(--bg-secondary)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
