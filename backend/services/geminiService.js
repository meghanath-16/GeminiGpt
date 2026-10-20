import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

// Initialize Google GenAI client
export const ai = new GoogleGenAI({});

/**
 * Format messages into Google GenAI contents format
 */
export function formatGeminiContents(messages) {
  return messages.map((msg) => {
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
    const parts = [];

    // Multimodal image (base64) attachment for image-to-text
    if (msg.image && msg.image.data) {
      parts.push({
        inlineData: {
          data: msg.image.data,
          mimeType: msg.image.mimeType || 'image/png',
        },
      });
    }

    // Text part
    if (msg.text && msg.text.trim()) {
      parts.push({ text: msg.text });
    }

    return { role, parts };
  });
}

/**
 * Stream Gemini Chat Response
 */
export async function streamChatResponse({ messages, model = 'gemini-3.8-flash', systemInstruction, onChunk }) {
  const lastUserMsg = messages[messages.length - 1];

  // Routing fallback if model doesn't support vision
  let selectedModel = model;
  if (lastUserMsg?.image && selectedModel === 'gemma-4-26b-a4b-it') {
    selectedModel = 'gemini-3.1-flash-lite';
  }

  const formattedContents = formatGeminiContents(messages);
  const config = {};
  if (systemInstruction && systemInstruction.trim()) {
    config.systemInstruction = systemInstruction.trim();
  }

  const stream = await ai.models.generateContentStream({
    model: selectedModel || 'gemini-3.8-flash',
    contents: formattedContents,
    ...(Object.keys(config).length > 0 ? { config } : {}),
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      onChunk(text);
    }
  }
}

/**
 * Generate Text-to-Image with Gemini prompt enhancement
 */
export async function generateImageFromPrompt(prompt) {
  let enhancedPrompt = prompt;
  try {
    const enhanceRes = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Create a vivid, detailed, artistic visual prompt under 30 words for an image generator based on this idea: "${prompt}". Output ONLY the prompt string.`,
    });
    if (enhanceRes.text && enhanceRes.text.trim()) {
      enhancedPrompt = enhanceRes.text.trim().replace(/["'\n\r]/g, '');
    }
  } catch (e) {
    // Fallback to original prompt if enhancement fails
  }

  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

  return {
    prompt,
    enhancedPrompt,
    imageUrl,
  };
}

/**
 * Generate concise 3-5 word conversation title
 */
export async function generateConversationTitle(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return 'New Chat';
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Generate a concise 3 to 5 word title summarizing this user question or prompt. Output ONLY the title, no quotes or punctuation at the end: "${prompt.slice(0, 200)}"`,
    });

    const cleanTitle = (response.text || '').replace(/["'\n\r]/g, '').trim();
    return cleanTitle || 'New Chat';
  } catch (err) {
    const fallback = prompt.slice(0, 30).trim() + (prompt.length > 30 ? '...' : '');
    return fallback || 'New Chat';
  }
}
