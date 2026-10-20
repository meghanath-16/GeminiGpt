/**
 * Gemini MERN Client API Service
 * Interacts with MongoDB chat endpoints and Gemini AI streaming routes
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '') : '') + '/api';

/**
 * Fetch list of all chats stored in MongoDB
 */
export async function fetchChats() {
  const res = await fetch(`${API_BASE}/chats`);
  if (!res.ok) throw new Error('Failed to fetch chats');
  return res.json();
}

/**
 * Fetch a single chat with its message history from MongoDB
 */
export async function fetchChatById(id) {
  const res = await fetch(`${API_BASE}/chats/${id}`);
  if (!res.ok) throw new Error('Failed to fetch chat');
  return res.json();
}

/**
 * Create a new chat session in MongoDB
 */
export async function createChat(chatData) {
  const res = await fetch(`${API_BASE}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatData),
  });
  if (!res.ok) throw new Error('Failed to create chat');
  return res.json();
}

/**
 * Update an existing chat in MongoDB (messages, title, model)
 */
export async function updateChat(id, updateData) {
  const res = await fetch(`${API_BASE}/chats/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw new Error('Failed to update chat');
  return res.json();
}

/**
 * Delete a chat session from MongoDB
 */
export async function deleteChat(id) {
  const res = await fetch(`${API_BASE}/chats/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete chat');
  return res.json();
}

/**
 * Clear all chats in MongoDB
 */
export async function clearAllChats() {
  const res = await fetch(`${API_BASE}/chats`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear chats');
  return res.json();
}

/**
 * Bulk sync past chats from localStorage into MongoDB
 */
export async function syncPastChatsToMongo(chats) {
  const res = await fetch(`${API_BASE}/chats/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chats }),
  });
  if (!res.ok) throw new Error('Failed to sync chats to MongoDB');
  return res.json();
}

/**
 * Seed past conversations into MongoDB
 */
export async function seedPastData(force = false) {
  const res = await fetch(`${API_BASE}/chats/seed?force=${force}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to seed past data');
  return res.json();
}

/**
 * Get API health and free models quota metadata
 */
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to check API health');
  return res.json();
}

/**
 * Generate 3-5 word concise title for chat
 */
export async function generateTitle(prompt) {
  const res = await fetch(`${API_BASE}/generate-title`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) return { title: 'New Chat' };
  return res.json();
}

/**
 * Generate Text-to-Image
 */
export async function generateImage(prompt) {
  const res = await fetch(`${API_BASE}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error('Failed to generate image');
  return res.json();
}

/**
 * Stream Gemini Chat Response via SSE
 */
export async function streamChat({ messages, model, systemInstruction, onChunk, onDone, onError }) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model, systemInstruction }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'chunk' && parsed.text) {
              onChunk(parsed.text);
            } else if (parsed.type === 'done') {
              if (onDone) onDone();
            } else if (parsed.type === 'error') {
              if (onError) onError(parsed.message);
            }
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        }
      }
    }

    if (onDone) onDone();
  } catch (err) {
    if (onError) onError(err.message || 'Network stream error');
  }
}
