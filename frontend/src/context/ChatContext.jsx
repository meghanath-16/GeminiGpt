import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchChats,
  fetchChatById,
  createChat as apiCreateChat,
  updateChat as apiUpdateChat,
  deleteChat as apiDeleteChat,
  clearAllChats as apiClearAllChats,
  seedPastData as apiSeedPastData,
  fetchHealth,
  generateTitle,
  streamChat,
} from '../services/api';
import { autoMigrateLocalStorageChats } from '../services/migration';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [activeModel, setActiveModel] = useState(() => localStorage.getItem('gemini_model') || 'gemini-3.8-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [systemInstruction, setSystemInstruction] = useState(() => localStorage.getItem('gemini_system_instruction') || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Load health, models and MongoDB chat history on mount
  const refreshChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const data = await fetchChats();
      setChats(data.chats || []);
      return data.chats || [];
    } catch (err) {
      console.error('Error fetching chats from MongoDB:', err);
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      // 1. Fetch health & models
      try {
        const health = await fetchHealth();
        if (health.models) {
          setAvailableModels(health.models);
        }
      } catch (e) {
        console.warn('API health check warning:', e);
      }

      // 2. Check for localStorage migration
      await autoMigrateLocalStorageChats();

      // 3. Load chats from MongoDB
      const loaded = await refreshChats();

      // If user had past data or empty DB, optionally seed
      if (loaded.length === 0) {
        try {
          const seeded = await apiSeedPastData();
          if (seeded.chats) {
            setChats(seeded.chats);
          }
        } catch (seedErr) {
          console.warn('Auto seed warning:', seedErr);
        }
      }
    }
    init();
  }, [refreshChats]);

  // Load active chat when currentChatId changes
  useEffect(() => {
    if (!currentChatId) {
      setCurrentChat(null);
      return;
    }

    const found = chats.find((c) => c.id === currentChatId);
    if (found) {
      setCurrentChat(found);
    } else {
      fetchChatById(currentChatId)
        .then((res) => {
          if (res.chat) setCurrentChat(res.chat);
        })
        .catch((e) => console.error('Error fetching chat by id:', e));
    }
  }, [currentChatId, chats]);

  // Save model & system instruction preferences
  const updateActiveModel = (modelId) => {
    setActiveModel(modelId);
    localStorage.setItem('gemini_model', modelId);
  };

  const updateSystemInstruction = (text) => {
    setSystemInstruction(text);
    localStorage.setItem('gemini_system_instruction', text);
  };

  // Start new chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setCurrentChat(null);
    setAttachedImage(null);
  };

  // Select chat from history
  const selectChat = (id) => {
    setCurrentChatId(id);
    setAttachedImage(null);
  };

  // Delete chat
  const deleteChatSession = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await apiDeleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (currentChatId === id) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // Clear all chats
  const clearAllHistory = async () => {
    try {
      await apiClearAllChats();
      setChats([]);
      startNewChat();
    } catch (err) {
      console.error('Failed to clear all chats:', err);
    }
  };

  // Seed / Re-seed past conversations into MongoDB
  const seedPastConversations = async () => {
    try {
      const result = await apiSeedPastData(true);
      if (result.chats) {
        setChats(result.chats);
        if (result.chats.length > 0) {
          setCurrentChatId(result.chats[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to seed past conversations:', err);
    }
  };

  // Send message and stream response
  const sendMessage = async (userText, imageAttachment = null) => {
    if ((!userText || !userText.trim()) && !imageAttachment) return;
    if (isStreaming) return;

    const trimmedText = (userText || '').trim();
    const userMsg = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: trimmedText,
      image: imageAttachment || null,
      timestamp: new Date(),
    };

    let activeChatObj = currentChat;
    let chatId = currentChatId;

    // If no active chat, create a new one in MongoDB
    if (!activeChatObj || !chatId) {
      chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      activeChatObj = {
        id: chatId,
        title: trimmedText.slice(0, 30) || 'New Chat',
        model: activeModel,
        systemInstruction,
        messages: [userMsg],
      };

      setCurrentChatId(chatId);
      setCurrentChat(activeChatObj);
      setChats((prev) => [activeChatObj, ...prev]);

      // Save initial session to MongoDB
      apiCreateChat(activeChatObj).catch((e) => console.error('MongoDB createChat error:', e));

      // Asynchronously generate 3-5 word concise title
      generateTitle(trimmedText).then((res) => {
        if (res.title && res.title !== 'New Chat') {
          activeChatObj.title = res.title;
          setCurrentChat({ ...activeChatObj });
          setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title: res.title } : c)));
          apiUpdateChat(chatId, { title: res.title }).catch(console.error);
        }
      });
    } else {
      // Append user message to existing chat
      const updatedMessages = [...(activeChatObj.messages || []), userMsg];
      activeChatObj = { ...activeChatObj, messages: updatedMessages };
      setCurrentChat(activeChatObj);
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, messages: updatedMessages } : c)));
    }

    // Clear attached image
    setAttachedImage(null);

    // Prepare assistant placeholder message for streaming
    const assistantMsgId = `msg_asst_${Date.now()}`;
    const assistantMsg = {
      id: assistantMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
    };

    activeChatObj = {
      ...activeChatObj,
      messages: [...activeChatObj.messages, assistantMsg],
    };
    setCurrentChat(activeChatObj);

    setIsStreaming(true);
    let accumulatedText = '';

    // Prepare messages payload for API (omit local metadata)
    const messagesPayload = activeChatObj.messages.slice(0, -1).map((m) => ({
      role: m.role,
      text: m.text,
      image: m.image,
    }));

    await streamChat({
      messages: messagesPayload,
      model: activeModel,
      systemInstruction,
      onChunk: (chunk) => {
        accumulatedText += chunk;
        setCurrentChat((prev) => {
          if (!prev) return prev;
          const updated = [...prev.messages];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0) {
            updated[lastIdx] = { ...updated[lastIdx], text: accumulatedText };
          }
          return { ...prev, messages: updated };
        });
      },
      onDone: () => {
        setIsStreaming(false);
        // Persist completed chat to MongoDB
        if (chatId) {
          apiUpdateChat(chatId, {
            messages: activeChatObj.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, text: accumulatedText } : m
            ),
          })
            .then(() => refreshChats())
            .catch((e) => console.error('Error persisting chat to MongoDB:', e));
        }
      },
      onError: (errMsg) => {
        setIsStreaming(false);
        accumulatedText += `\n\n⚠️ *Error:* ${errMsg}`;
        setCurrentChat((prev) => {
          if (!prev) return prev;
          const updated = [...prev.messages];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0) {
            updated[lastIdx] = { ...updated[lastIdx], text: accumulatedText };
          }
          return { ...prev, messages: updated };
        });
      },
    });
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentChat,
        activeModel,
        availableModels,
        systemInstruction,
        isStreaming,
        attachedImage,
        isLoadingChats,
        setAttachedImage,
        updateActiveModel,
        updateSystemInstruction,
        startNewChat,
        selectChat,
        deleteChatSession,
        clearAllHistory,
        seedPastConversations,
        sendMessage,
        refreshChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
