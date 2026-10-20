import React, { useState } from 'react';
import { Sparkles, User, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { marked } from 'marked';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function ChatMessage({ message, isStreamingLast }) {
  const isModel = message.role === 'model' || message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const { speak, stop, isSpeaking, currentId } = useSpeechSynthesis();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCurrentSpeaking = isSpeaking && currentId === message.id;

  const toggleSpeak = () => {
    if (isCurrentSpeaking) {
      stop();
    } else {
      speak(message.text || '', message.id);
    }
  };

  const renderedHtml = marked.parse(message.text || '');

  return (
    <div className={`message-row ${isModel ? 'model' : 'user'}`}>
      {isModel && (
        <div className="message-avatar model" title="Gemini AI">
          <Sparkles size={18} />
        </div>
      )}

      <div className="message-bubble">
        {/* User Multimodal Image Attachment (if present) */}
        {message.image && message.image.data && (
          <div style={{ marginBottom: '10px' }}>
            <img
              src={
                message.image.data.startsWith('data:')
                  ? message.image.data
                  : `data:${message.image.mimeType || 'image/png'};base64,${message.image.data}`
              }
              alt="Multimodal input"
              style={{
                maxWidth: '300px',
                maxHeight: '220px',
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                border: '1px solid var(--border-color)',
              }}
            />
          </div>
        )}

        {/* Message Content */}
        {isModel ? (
          <div>
            {!message.text && isStreamingLast ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 0' }}>
                <span className="typing-dot"></span>
                <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
              </div>
            ) : (
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
        )}

        {/* Action toolbar for AI messages */}
        {isModel && message.text && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '12px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-light)',
            }}
          >
            <button
              className="icon-btn"
              onClick={handleCopy}
              style={{ padding: '4px 8px', fontSize: '0.78rem', gap: '4px', borderRadius: '4px' }}
              title="Copy response to clipboard"
            >
              {copied ? <Check size={14} color="#34a853" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              className="icon-btn"
              onClick={toggleSpeak}
              style={{
                padding: '4px 8px',
                fontSize: '0.78rem',
                gap: '4px',
                borderRadius: '4px',
                color: isCurrentSpeaking ? 'var(--accent-blue)' : 'inherit',
              }}
              title={isCurrentSpeaking ? 'Stop listening' : 'Listen with Speech Synthesis'}
            >
              {isCurrentSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isCurrentSpeaking ? 'Stop' : 'Listen'}</span>
            </button>
          </div>
        )}
      </div>

      {!isModel && (
        <div
          className="message-avatar"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
          title="You"
        >
          <User size={18} />
        </div>
      )}
    </div>
  );
}
