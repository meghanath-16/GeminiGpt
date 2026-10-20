import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image as ImageIcon, Mic, MicOff, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { ImagePreview } from './ImagePreview';

export function ChatInput() {
  const { sendMessage, isStreaming, attachedImage, setAttachedImage } = useChat();
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

  // Populate transcript from speech recognition into textarea
  useEffect(() => {
    if (transcript) {
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Handle Form Submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isStreaming) return;

    sendMessage(inputText, attachedImage);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result.split(',')[1];
      setAttachedImage({
        data: base64Data,
        mimeType: file.type || 'image/png',
        name: file.name,
        url: event.target.result,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Handle paste events (e.g. screenshots with Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target.result.split(',')[1];
            setAttachedImage({
              data: base64Data,
              mimeType: file.type || 'image/png',
              name: 'Pasted Screenshot.png',
              url: event.target.result,
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  return (
    <div className="input-dock">
      <div className="input-box-wrapper">
        <ImagePreview />

        <textarea
          ref={textareaRef}
          className="input-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={isListening ? 'Listening to speech...' : 'Ask Gemini anything, paste images, or type /image...'}
          rows={1}
        />

        <div className="input-actions-bar">
          <div className="input-left-tools">
            {/* Hidden file input for images */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <button
              className="icon-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach image (multimodal vision)"
            >
              <ImageIcon size={19} />
            </button>

            {hasSupport && (
              <button
                className="icon-btn"
                onClick={isListening ? stopListening : startListening}
                style={{ color: isListening ? '#ea4335' : 'inherit' }}
                title={isListening ? 'Stop listening' : 'Dictate with voice'}
              >
                {isListening ? <MicOff size={19} /> : <Mic size={19} />}
              </button>
            )}

            <button
              className="icon-btn"
              onClick={() => setInputText((prev) => (prev.startsWith('/image ') ? prev : `/image ${prev}`))}
              style={{ fontSize: '0.8rem', gap: '4px', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
              title="Create image with /image"
            >
              <Sparkles size={15} color="var(--accent-purple)" />
              <span style={{ fontSize: '0.78rem' }}>Image</span>
            </button>
          </div>

          <div className="input-right-tools">
            <button
              className="send-btn"
              onClick={handleSubmit}
              disabled={(!inputText.trim() && !attachedImage) || isStreaming}
              title="Send message"
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
