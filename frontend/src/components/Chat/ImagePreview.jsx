import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export function ImagePreview() {
  const { attachedImage, setAttachedImage } = useChat();

  if (!attachedImage) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 10px',
        marginBottom: '6px',
        maxWidth: '280px',
      }}
    >
      {attachedImage.url ? (
        <img
          src={attachedImage.url}
          alt="attachment preview"
          style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : (
        <ImageIcon size={20} color="var(--accent-blue)" />
      )}
      <span
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
        }}
      >
        {attachedImage.name || 'Image attached'}
      </span>
      <button
        onClick={() => setAttachedImage(null)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Remove attachment"
      >
        <X size={14} />
      </button>
    </div>
  );
}
