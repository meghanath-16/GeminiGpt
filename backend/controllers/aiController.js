import {
  streamChatResponse,
  generateImageFromPrompt,
  generateConversationTitle,
} from '../services/geminiService.js';

/**
 * Handle Streaming Chat API endpoint (Server-Sent Events)
 */
export const handleChatStream = async (req, res) => {
  const { messages, model = 'gemini-3.8-flash', systemInstruction } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const lastUserMsg = messages[messages.length - 1];

    // Check if user is using the image generation model OR explicitly requested image creation
    const isImageModel = model === 'image-gen-nano';
    const promptText = (lastUserMsg?.text || '').toLowerCase();
    const isExplicitImagePrompt =
      isImageModel ||
      (!lastUserMsg?.image &&
        (promptText.startsWith('/image') ||
          promptText.startsWith('generate image of') ||
          promptText.startsWith('generate an image of') ||
          promptText.startsWith('create an image of') ||
          promptText.startsWith('draw an image of') ||
          promptText.startsWith('draw a ')));

    if (isExplicitImagePrompt) {
      sendEvent({ type: 'chunk', text: '🎨 *Crafting your image...*\n\n' });

      let cleanPrompt = lastUserMsg.text
        .replace(/^\/image\s*/i, '')
        .replace(/^generate an? image of\s*/i, '')
        .replace(/^create an? image of\s*/i, '')
        .replace(/^draw an? image of\s*/i, '')
        .replace(/^draw a\s*/i, '')
        .trim();

      if (!cleanPrompt) cleanPrompt = 'A beautiful futuristic landscape with vibrant colors';

      const imageResult = await generateImageFromPrompt(cleanPrompt);
      const markdownImage = `![${cleanPrompt}](${imageResult.imageUrl})\n\n**Prompt:** *${cleanPrompt}*\n\n[⬇️ View Full Resolution Image](${imageResult.imageUrl})`;

      sendEvent({ type: 'chunk', text: markdownImage });
      sendEvent({ type: 'done' });
      return res.end();
    }

    // Normal text & multimodal vision handling with Gemini models
    await streamChatResponse({
      messages,
      model,
      systemInstruction,
      onChunk: (chunk) => sendEvent({ type: 'chunk', text: chunk }),
    });

    sendEvent({ type: 'done' });
    res.end();
  } catch (error) {
    console.error('Gemini API Error:', error);
    sendEvent({
      type: 'error',
      message: error.message || 'An unexpected error occurred while communicating with Gemini.',
    });
    res.end();
  }
};

/**
 * Handle standalone Text-to-Image Generation endpoint
 */
export const handleGenerateImage = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required for image generation.' });
  }

  try {
    const result = await generateImageFromPrompt(prompt);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: 'Failed to generate image.' });
  }
};

/**
 * Handle Title Generation endpoint for new chat sessions
 */
export const handleGenerateTitle = async (req, res) => {
  const { prompt } = req.body;
  try {
    const title = await generateConversationTitle(prompt);
    res.json({ title });
  } catch (err) {
    console.error('Error generating title:', err);
    res.json({ title: 'New Chat' });
  }
};
