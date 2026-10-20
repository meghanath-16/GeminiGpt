import React, { useState } from 'react';
import { Menu, ChevronDown, Sun, Moon, Sparkles, Settings } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { ModelSelectorModal } from './ModelSelectorModal';
import { SettingsModal } from '../Sidebar/SettingsModal';

export function Header({ toggleSidebar }) {
  const { activeModel, availableModels } = useChat();
  const { theme, toggleTheme } = useTheme();
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentModelObj = availableModels.find((m) => m.id === activeModel) || {
    name: 'Gemini 3.8 Flash',
    badge: 'Recommended',
  };

  return (
    <>
      <header className="top-header">
        <div className="header-left">
          <button className="icon-btn" onClick={toggleSidebar} title="Toggle sidebar">
            <Menu size={20} />
          </button>
          <div className="logo-container">
            <Sparkles size={22} color="#4285f4" />
            <span className="gemini-sparkle">Gemini</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(66, 133, 244, 0.15)', color: 'var(--accent-blue)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              MERN
            </span>
          </div>
        </div>

        <div className="header-right">
          {/* Active Model Selector Button */}
          <button
            className="model-selector-btn"
            onClick={() => setIsModelModalOpen(true)}
            title="Switch Gemini AI Model"
          >
            <span>{currentModelObj.name}</span>
            {currentModelObj.badge && (
              <span className="badge-pill">{currentModelObj.badge}</span>
            )}
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
          </button>

          {/* Theme Switcher Button */}
          <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* Settings Button */}
          <button className="icon-btn" onClick={() => setIsSettingsOpen(true)} title="Settings & Persona">
            <Settings size={19} />
          </button>
        </div>
      </header>

      {/* Model Selector Modal Popover */}
      <ModelSelectorModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
