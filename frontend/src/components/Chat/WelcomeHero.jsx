import React from 'react';
import { Sparkles, Code2, Image, Lightbulb, Compass } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Explain Concepts',
    desc: 'Quantum computing superposition & entanglement in simple terms',
    prompt: 'Explain quantum superposition and entanglement in simple terms for a software engineer.',
  },
  {
    icon: Code2,
    title: 'Code Architecture',
    desc: 'React 19 Actions and Concurrent Mode performance advantages',
    prompt: 'What are the main performance advantages of React 19 Actions and useTransition?',
  },
  {
    icon: Image,
    title: 'Text-to-Image Synthesis',
    desc: 'Generate a futuristic cyberpunk skyline with neon reflections',
    prompt: '/image A breathtaking neon cyberpunk city with flying vehicles and rain reflections, cinematic lighting 8k',
  },
  {
    icon: Compass,
    title: 'Multimodal Vision',
    desc: 'Analyze architecture diagrams, screenshots or charts',
    prompt: 'How does Gemini process multimodal tokens natively compared to legacy pipeline approaches?',
  },
];

export function WelcomeHero() {
  const { sendMessage } = useChat();

  return (
    <div className="welcome-hero">
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(66, 133, 244, 0.1)', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
        <Sparkles size={16} /> Google Gemini AI • MERN Fullstack
      </div>

      <div>
        <h1 className="hero-title">
          <span className="gemini-sparkle">Hello, Explorer</span>
        </h1>
        <p className="hero-subtitle">
          How can Gemini assist you today? Ask questions, write code, upload diagrams, or generate art with MongoDB persistent chat history.
        </p>
      </div>

      <div className="prompt-suggestions">
        {SUGGESTIONS.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div
              key={idx}
              className="suggestion-card"
              onClick={() => sendMessage(item.prompt)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)' }}>
                <IconComponent size={18} />
                <span className="suggestion-title">{item.title}</span>
              </div>
              <span className="suggestion-desc">{item.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
