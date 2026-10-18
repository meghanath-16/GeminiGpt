/**
 * Google Gemini Clone - Modern Frontend Application Logic
 * Supports Free Tier Models, Quota Metrics, Text-to-Image, Vision Analysis & Theme Switching
 */

// State Management
const STATE = {
  currentChatId: null,
  chats: {}, // { [id]: { id, title, createdAt, updatedAt, messages: [] } }
  activeModel: 'gemini-3.8-flash',
  availableModels: [],
  activeFilterTab: 'all',
  systemInstruction: '',
  isStreaming: false,
  attachedImage: null, // { data: base64, mimeType, name, url }
  isRecording: false,
  recognition: null
};

// Fallback list of free models (will be refreshed from /api/health)
const DEFAULT_FREE_MODELS = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    category: "Flagship & Vision",
    rpm: "5",
    tpm: "250K",
    rpd: "20",
    badge: "Recommended",
    capabilities: ["Text", "Vision", "Streaming"],
    description: "Google's flagship multimodal model. Best reasoning, coding, and vision analysis."
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    category: "High Quota (500 RPD)",
    rpm: "15",
    tpm: "250K",
    rpd: "500",
    badge: "500 RPD",
    capabilities: ["Text", "Vision", "Ultra Fast"],
    description: "Ultra-fast lightweight model with generous 500 daily requests and multimodal vision support."
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    category: "High Quota (500 RPD)",
    rpm: "15",
    tpm: "250K",
    rpd: "500",
    badge: "500 RPD",
    capabilities: ["Text", "Vision", "High Throughput"],
    description: "High-efficiency model designed for high daily request volume (500 RPD) with visual inputs."
  },
  {
    id: "gemma-4-26b-a4b-it",
    name: "Gemma 4 26B",
    category: "Massive Quota (14.4K RPD)",
    rpm: "30",
    tpm: "16K",
    rpd: "14.4K",
    badge: "14.4K RPD",
    capabilities: ["Text", "Instruction Tuned", "High Volume"],
    description: "Google's open-weights 26B instruction-tuned model with a massive 14,400 daily request quota."
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    category: "Reasoning & Deep Logic",
    rpm: "5",
    tpm: "250K",
    rpd: "20",
    badge: "Reasoning",
    capabilities: ["Text", "Vision", "Complex Logic"],
    description: "Advanced reasoning and problem-solving model for math, coding, and structured tasks."
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    category: "General Purpose",
    rpm: "5",
    tpm: "250K",
    rpd: "20",
    badge: "20 RPD",
    capabilities: ["Text", "Vision", "Fast"],
    description: "Versatile Flash release balancing speed and comprehension for everyday conversations."
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    category: "Preview Releases",
    rpm: "5",
    tpm: "250K",
    rpd: "20",
    badge: "Preview",
    capabilities: ["Text", "Vision"],
    description: "Preview version of Gemini 3 Flash series for quick testing and early exploration."
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    category: "General Purpose",
    rpm: "10",
    tpm: "250K",
    rpd: "20",
    badge: "10 RPM",
    capabilities: ["Text", "Lightweight"],
    description: "Compact 2.5 Flash generation model with 10 requests per minute throughput."
  },
  {
    id: "image-gen-nano",
    name: "Nano Banana / Imagen Generator",
    category: "Text-to-Image",
    rpm: "15",
    tpm: "N/A",
    rpd: "Unlimited",
    badge: "Text-to-Image",
    capabilities: ["Image Generation", "Visual Art", "Photo Synthesis"],
    description: "Generates stunning high-resolution images from natural language text descriptions."
  }
];

// DOM Elements
const elements = {
  sidebar: document.getElementById('sidebar'),
  sidebarCollapseBtn: document.getElementById('sidebar-collapse-btn'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  newChatBtn: document.getElementById('new-chat-btn'),
  chatList: document.getElementById('chat-list'),
  chatCount: document.getElementById('chat-count'),
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIcon: document.getElementById('theme-icon'),
  themeLabel: document.getElementById('theme-label'),
  settingsBtn: document.getElementById('settings-btn'),
  settingsModal: document.getElementById('settings-modal'),
  closeSettingsBtn: document.getElementById('close-settings-btn'),
  saveSettingsBtn: document.getElementById('save-settings-btn'),
  clearAllHistoryBtn: document.getElementById('clear-all-history-btn'),
  systemInstructionInput: document.getElementById('system-instruction-input'),
  backendUrlInput: document.getElementById('backend-url-input'),

  // Redesigned Model Picker Elements
  modelPickerTrigger: document.getElementById('model-picker-trigger'),
  currentModelName: document.getElementById('current-model-name'),
  currentModelBadge: document.getElementById('current-model-badge'),
  modelModal: document.getElementById('model-modal'),
  closeModelModalBtn: document.getElementById('close-model-modal-btn'),
  modelCardsList: document.getElementById('model-cards-list'),
  modelTabs: document.querySelectorAll('.model-tab'),

  // Chat Area
  chatViewport: document.getElementById('chat-viewport'),
  welcomeContainer: document.getElementById('welcome-container'),
  messagesContainer: document.getElementById('messages-container'),
  chatForm: document.getElementById('chat-form'),
  promptInput: document.getElementById('prompt-input'),
  sendBtn: document.getElementById('send-btn'),
  attachBtn: document.getElementById('attach-btn'),
  fileInput: document.getElementById('file-input'),
  micBtn: document.getElementById('mic-btn'),
  attachmentPreviewStrip: document.getElementById('attachment-preview-strip'),
  imagePreview: document.getElementById('image-preview'),
  removeAttachmentBtn: document.getElementById('remove-attachment-btn'),
  attachmentName: document.getElementById('attachment-name'),
  apiStatusText: document.getElementById('api-status-text'),
  navQuotaSummary: document.getElementById('nav-quota-summary'),

  // Quick Mode Pills
  modeTextToImage: document.getElementById('mode-text-to-image'),
  modeHighQuota: document.getElementById('mode-high-quota'),
  modeVision: document.getElementById('mode-vision')
};

// Resolve API URL (supports local development, Render backend, or Vercel proxy)
function getApiUrl(path) {
  const customUrl = (localStorage.getItem('gemini_backend_url') || '').trim().replace(/\/+$/, '');
  if (customUrl) {
    return `${customUrl}${path}`;
  }
  return path;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  STATE.availableModels = [...DEFAULT_FREE_MODELS];
  loadStoredPreferences();
  loadStoredChats();
  checkApiHealth();
  setupEventListeners();
  setupPromptAutoResize();
  setupPasteHandler();

  if (!STATE.currentChatId || !STATE.chats[STATE.currentChatId]) {
    startNewChat();
  } else {
    renderChat(STATE.currentChatId);
  }
});

// Check API Health & Load Models
async function checkApiHealth() {
  try {
    const res = await fetch(getApiUrl('/api/health'));
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();

    if (data.models && Array.isArray(data.models)) {
      STATE.availableModels = data.models;
    }

    updateCurrentModelDisplay();
    renderModelCards();

    if (elements.apiStatusText) {
      elements.apiStatusText.textContent = `Free Tier Connected`;
    }
    if (elements.navQuotaSummary) {
      elements.navQuotaSummary.textContent = `Free Models Active`;
    }
  } catch (err) {
    console.warn('API Health Warning:', err);
    STATE.availableModels = [...DEFAULT_FREE_MODELS];
    updateCurrentModelDisplay();
    renderModelCards();
  }
}

// Storage helpers
function loadStoredPreferences() {
  const savedTheme = localStorage.getItem('gemini_theme') || 'dark';
  applyTheme(savedTheme);

  const savedModel = localStorage.getItem('gemini_model') || 'gemini-3.8-flash';
  STATE.activeModel = savedModel;
  updateCurrentModelDisplay();

  const savedInstructions = localStorage.getItem('gemini_system_instruction') || '';
  STATE.systemInstruction = savedInstructions;
  if (elements.systemInstructionInput) elements.systemInstructionInput.value = savedInstructions;

  const savedBackendUrl = localStorage.getItem('gemini_backend_url') || '';
  if (elements.backendUrlInput) elements.backendUrlInput.value = savedBackendUrl;
}

function loadStoredChats() {
  try {
    const raw = localStorage.getItem('gemini_chats');
    if (raw) {
      STATE.chats = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading chats:', e);
    STATE.chats = {};
  }
  renderSidebarChats();
}

function saveChatsToStorage() {
  try {
    localStorage.setItem('gemini_chats', JSON.stringify(STATE.chats));
  } catch (e) {
    console.error('Error saving chats:', e);
  }
  renderSidebarChats();
}

// Theme handling
function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    elements.themeLabel.textContent = 'Dark mode';
    elements.themeIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    elements.themeLabel.textContent = 'Light mode';
    elements.themeIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  }
  localStorage.setItem('gemini_theme', theme);
}

// Update Top Navigation Model Badge
function updateCurrentModelDisplay() {
  const modelObj = STATE.availableModels.find(m => m.id === STATE.activeModel) || {
    name: 'Gemini 3.8 Flash',
    badge: 'Recommended'
  };

  if (elements.currentModelName) elements.currentModelName.textContent = modelObj.name;
  if (elements.currentModelBadge) elements.currentModelBadge.textContent = modelObj.badge || 'Free';
}

// Render Model Cards in Modal Popover
function renderModelCards() {
  const container = elements.modelCardsList;
  if (!container) return;

  container.innerHTML = '';

  const filtered = STATE.availableModels.filter(m => {
    if (STATE.activeFilterTab === 'all') return true;
    if (STATE.activeFilterTab === 'high-quota') {
      return m.rpd === '500' || m.rpd === '14.4K';
    }
    if (STATE.activeFilterTab === 'flagship') {
      return m.id.includes('3.8') || m.id.includes('3.7') || m.id.includes('3.6');
    }
    if (STATE.activeFilterTab === 'image') {
      return m.id === 'image-gen-nano';
    }
    return true;
  });

  filtered.forEach(model => {
    const isSelected = model.id === STATE.activeModel;
    const card = document.createElement('div');
    card.className = `model-card-item ${isSelected ? 'selected' : ''}`;
    card.onclick = () => selectModel(model.id);

    const isHighQuota = model.rpd === '500' || model.rpd === '14.4K';

    const capabilitiesHtml = (model.capabilities || []).map(c => `
      <span class="cap-tag">${c}</span>
    `).join('');

    card.innerHTML = `
      <div class="model-card-header">
        <div class="model-card-title-group">
          <div class="model-card-title">
            <span>${model.name}</span>
          </div>
          <span class="model-card-category">${model.category || 'Text & Vision'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="model-card-badge">${model.badge || 'Free'}</span>
          <div class="selected-check-icon">
            ${isSelected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
        </div>
      </div>

      <p class="model-card-desc">${model.description || ''}</p>

      <div class="model-quota-metrics">
        <div class="quota-metric-box">
          <span class="quota-metric-label">RPM</span>
          <span class="quota-metric-val">${model.rpm || '5'}</span>
        </div>
        <div class="quota-metric-box">
          <span class="quota-metric-label">TPM</span>
          <span class="quota-metric-val">${model.tpm || '250K'}</span>
        </div>
        <div class="quota-metric-box">
          <span class="quota-metric-label">RPD (Daily)</span>
          <span class="quota-metric-val ${isHighQuota ? 'highlight-quota' : ''}">${model.rpd || '20'}</span>
        </div>
      </div>

      <div class="model-capabilities-strip">
        ${capabilitiesHtml}
      </div>
    `;

    container.appendChild(card);
  });
}

function selectModel(modelId) {
  STATE.activeModel = modelId;
  localStorage.setItem('gemini_model', modelId);
  updateCurrentModelDisplay();
  renderModelCards();

  // Close model modal
  if (elements.modelModal) elements.modelModal.style.display = 'none';
  if (elements.modelPickerTrigger) elements.modelPickerTrigger.classList.remove('active');

  const modelObj = STATE.availableModels.find(m => m.id === modelId);
  showToast(`Switched to ${modelObj ? modelObj.name : modelId}`);
}

// Toast helper
function showToast(message) {
  const existing = document.getElementById('gemini-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'gemini-toast';
  toast.style.cssText = `
    position: fixed;
    top: 76px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    color: var(--text-primary);
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    box-shadow: var(--shadow-md);
    z-index: 200;
    animation: fadeIn 0.2s ease-out;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2400);
}

// Event Listeners
function setupEventListeners() {
  // Sidebar toggling
  elements.sidebarCollapseBtn?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('collapsed');
  });

  elements.mobileMenuBtn?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('mobile-open');
  });

  elements.chatViewport?.addEventListener('click', () => {
    if (elements.sidebar.classList.contains('mobile-open')) {
      elements.sidebar.classList.remove('mobile-open');
    }
  });

  // Theme toggle
  elements.themeToggleBtn?.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    applyTheme(isLight ? 'dark' : 'light');
    renderModelCards();
  });

  // Model Picker Trigger
  elements.modelPickerTrigger?.addEventListener('click', () => {
    elements.modelPickerTrigger.classList.toggle('active');
    elements.modelModal.style.display = 'flex';
    renderModelCards();
  });

  elements.closeModelModalBtn?.addEventListener('click', () => {
    elements.modelModal.style.display = 'none';
    elements.modelPickerTrigger.classList.remove('active');
  });

  elements.modelModal?.addEventListener('click', (e) => {
    if (e.target === elements.modelModal) {
      elements.modelModal.style.display = 'none';
      elements.modelPickerTrigger.classList.remove('active');
    }
  });

  // Model Category Filter Tabs
  elements.modelTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      elements.modelTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      STATE.activeFilterTab = tab.getAttribute('data-tab');
      renderModelCards();
    });
  });

  // Quick Dock Mode Pills
  elements.modeTextToImage?.addEventListener('click', () => {
    selectModel('image-gen-nano');
    elements.promptInput.value = 'Generate an image of ';
    elements.promptInput.focus();
    updateSendButtonState();
  });

  elements.modeHighQuota?.addEventListener('click', () => {
    selectModel('gemini-3.1-flash-lite');
    elements.promptInput.focus();
  });

  elements.modeVision?.addEventListener('click', () => {
    elements.fileInput.click();
  });

  // New Chat
  elements.newChatBtn?.addEventListener('click', () => {
    startNewChat();
  });

  // Settings Modal
  elements.settingsBtn?.addEventListener('click', () => {
    elements.settingsModal.style.display = 'flex';
  });

  elements.closeSettingsBtn?.addEventListener('click', () => {
    elements.settingsModal.style.display = 'none';
  });

  elements.settingsModal?.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      elements.settingsModal.style.display = 'none';
    }
  });

  elements.saveSettingsBtn?.addEventListener('click', () => {
    const val = elements.systemInstructionInput.value.trim();
    STATE.systemInstruction = val;
    localStorage.setItem('gemini_system_instruction', val);

    const backendUrl = elements.backendUrlInput ? elements.backendUrlInput.value.trim() : '';
    localStorage.setItem('gemini_backend_url', backendUrl);

    elements.settingsModal.style.display = 'none';
    showToast('Preferences saved');
    checkApiHealth();
  });

  elements.clearAllHistoryBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all conversations?')) {
      STATE.chats = {};
      saveChatsToStorage();
      startNewChat();
      elements.settingsModal.style.display = 'none';
    }
  });

  // Prompt Form Submission
  elements.chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmitPrompt();
  });

  elements.promptInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitPrompt();
    }
  });

  elements.promptInput?.addEventListener('input', updateSendButtonState);

  // Suggested prompt chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        elements.promptInput.value = prompt;
        updateSendButtonState();
        handleSubmitPrompt();
      }
    });
  });

  // File / Image Attachment
  elements.attachBtn?.addEventListener('click', () => {
    elements.fileInput.click();
  });

  elements.fileInput?.addEventListener('change', handleFileSelected);
  elements.removeAttachmentBtn?.addEventListener('click', clearAttachment);

  // Microphone (Speech to text)
  elements.micBtn?.addEventListener('click', toggleSpeechRecognition);
}

// Auto-resizing textarea
function setupPromptAutoResize() {
  const textarea = elements.promptInput;
  if (!textarea) return;

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 180) + 'px';
  });
}

function updateSendButtonState() {
  const hasText = elements.promptInput.value.trim().length > 0;
  const hasAttachment = Boolean(STATE.attachedImage);
  const isEnabled = (hasText || hasAttachment) && !STATE.isStreaming;

  elements.sendBtn.disabled = !isEnabled;
  if (isEnabled) {
    elements.sendBtn.classList.add('ready');
  } else {
    elements.sendBtn.classList.remove('ready');
  }
}

// Clipboard Paste for Images
function setupPasteHandler() {
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        processImageFile(blob, 'pasted-image.png');
        break;
      }
    }
  });
}

function handleFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  processImageFile(file, file.name);
  e.target.value = '';
}

function processImageFile(file, fileName) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (PNG, JPG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Url = event.target.result;
    const base64Data = base64Url.split(',')[1];

    STATE.attachedImage = {
      data: base64Data,
      mimeType: file.type,
      name: fileName || file.name || 'image.png',
      url: base64Url
    };

    elements.imagePreview.src = base64Url;
    elements.attachmentName.textContent = STATE.attachedImage.name;
    elements.attachmentPreviewStrip.style.display = 'flex';
    updateSendButtonState();
    showToast('Image attached (Vision analysis active)');
  };
  reader.readAsDataURL(file);
}

function clearAttachment() {
  STATE.attachedImage = null;
  elements.attachmentPreviewStrip.style.display = 'none';
  elements.imagePreview.src = '';
  updateSendButtonState();
}

// Voice input via Web Speech API
function toggleSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in this browser. Please try Google Chrome or Edge.');
    return;
  }

  if (STATE.isRecording) {
    if (STATE.recognition) STATE.recognition.stop();
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      STATE.isRecording = true;
      elements.micBtn.classList.add('recording');
    };

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      elements.promptInput.value = transcript;
      updateSendButtonState();
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      recognition.stop();
    };

    recognition.onend = () => {
      STATE.isRecording = false;
      elements.micBtn.classList.remove('recording');
    };

    STATE.recognition = recognition;
    recognition.start();
  } catch (err) {
    console.error('Speech recognition failed to start:', err);
    STATE.isRecording = false;
    elements.micBtn.classList.remove('recording');
  }
}

// Chat Session Handling
function startNewChat() {
  const newId = 'chat_' + Date.now();
  STATE.currentChatId = newId;
  STATE.chats[newId] = {
    id: newId,
    title: 'New chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };

  saveChatsToStorage();
  renderChat(newId);
  elements.promptInput.focus();
}

function selectChat(id) {
  if (STATE.isStreaming) return;
  if (!STATE.chats[id]) return;
  STATE.currentChatId = id;
  renderChat(id);
  renderSidebarChats();
}

function deleteChat(id, e) {
  if (e) e.stopPropagation();
  if (confirm('Delete this chat?')) {
    delete STATE.chats[id];
    saveChatsToStorage();

    if (STATE.currentChatId === id) {
      const remainingIds = Object.keys(STATE.chats);
      if (remainingIds.length > 0) {
        selectChat(remainingIds[remainingIds.length - 1]);
      } else {
        startNewChat();
      }
    } else {
      renderSidebarChats();
    }
  }
}

function renderSidebarChats() {
  const list = elements.chatList;
  if (!list) return;

  const chatEntries = Object.values(STATE.chats).sort((a, b) => b.updatedAt - a.updatedAt);
  elements.chatCount.textContent = chatEntries.length;

  list.innerHTML = '';

  if (chatEntries.length === 0) {
    list.innerHTML = `<div style="padding: 12px 14px; font-size: 13px; color: var(--text-muted);">No recent chats</div>`;
    return;
  }

  chatEntries.forEach(chat => {
    const item = document.createElement('div');
    item.className = `chat-item ${chat.id === STATE.currentChatId ? 'active' : ''}`;
    item.onclick = () => selectChat(chat.id);

    item.innerHTML = `
      <div class="chat-item-main">
        <div class="chat-item-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </div>
        <span class="chat-title">${escapeHtml(chat.title || 'New chat')}</span>
      </div>
      <div class="chat-item-actions">
        <button class="chat-action-btn" title="Delete conversation" onclick="deleteChat('${chat.id}', event)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;

    list.appendChild(item);
  });
}

function renderChat(chatId) {
  const chat = STATE.chats[chatId];
  if (!chat || chat.messages.length === 0) {
    elements.welcomeContainer.style.display = 'flex';
    elements.messagesContainer.style.display = 'none';
    elements.messagesContainer.innerHTML = '';
    return;
  }

  elements.welcomeContainer.style.display = 'none';
  elements.messagesContainer.style.display = 'flex';
  elements.messagesContainer.innerHTML = '';

  chat.messages.forEach((msg, idx) => {
    appendMessageToDOM(msg.role, msg.text, msg.image, idx);
  });

  scrollToBottom();
}

function scrollToBottom() {
  elements.chatViewport.scrollTo({
    top: elements.chatViewport.scrollHeight,
    behavior: 'smooth'
  });
}

// Submitting a Prompt
async function handleSubmitPrompt() {
  const prompt = elements.promptInput.value.trim();
  const image = STATE.attachedImage;

  if (!prompt && !image) return;
  if (STATE.isStreaming) return;

  if (!STATE.currentChatId || !STATE.chats[STATE.currentChatId]) {
    startNewChat();
  }

  const currentChat = STATE.chats[STATE.currentChatId];
  if (!currentChat) return;

  // Clear inputs
  elements.promptInput.value = '';
  elements.promptInput.style.height = 'auto';
  clearAttachment();
  updateSendButtonState();

  // Hide welcome hero
  elements.welcomeContainer.style.display = 'none';
  elements.messagesContainer.style.display = 'flex';

  // 1. Add User Message
  const userMsg = {
    role: 'user',
    text: prompt,
    image: image ? { data: image.data, mimeType: image.mimeType, url: image.url } : null,
    timestamp: Date.now()
  };
  currentChat.messages.push(userMsg);
  appendMessageToDOM('user', userMsg.text, userMsg.image, currentChat.messages.length - 1);
  scrollToBottom();

  if (currentChat.messages.length === 1 && prompt) {
    generateChatTitle(prompt, currentChat.id);
  }

  // 2. Prepare Assistant Message Placeholder
  const assistantMsgIndex = currentChat.messages.length;
  const assistantMsg = {
    role: 'assistant',
    text: '',
    timestamp: Date.now()
  };
  currentChat.messages.push(assistantMsg);

  const assistantBubble = appendMessageToDOM('assistant', '', null, assistantMsgIndex, true);
  scrollToBottom();

  // 3. Initiate SSE Streaming Request
  STATE.isStreaming = true;
  updateSendButtonState();

  try {
    const payloadMessages = currentChat.messages.slice(0, -1).map(m => ({
      role: m.role,
      text: m.text,
      image: m.image
    }));

    const response = await fetch(getApiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: payloadMessages,
        model: STATE.activeModel,
        systemInstruction: STATE.systemInstruction
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));

            if (data.type === 'chunk') {
              fullText += data.text;
              assistantBubble.innerHTML = parseMarkdown(fullText) + '<span class="streaming-cursor"></span>';
              scrollToBottom();
            } else if (data.type === 'error') {
              fullText += `\n\n> ⚠️ **Notice:** ${data.message}`;
              assistantBubble.innerHTML = parseMarkdown(fullText);
            }
          } catch (jsonErr) {
            console.error('SSE parse error:', jsonErr);
          }
        }
      }
    }

    assistantMsg.text = fullText;
    currentChat.updatedAt = Date.now();
    saveChatsToStorage();

    assistantBubble.innerHTML = parseMarkdown(fullText);
    attachAssistantActions(assistantBubble.parentElement, fullText, assistantMsgIndex);
    scrollToBottom();
  } catch (err) {
    console.error('Chat error:', err);
    assistantMsg.text = `Connection error: ${err.message}. Please check your connection or switch to another free model.`;
    assistantBubble.innerHTML = parseMarkdown(assistantMsg.text);
    saveChatsToStorage();
  } finally {
    STATE.isStreaming = false;
    updateSendButtonState();
  }
}

// Generate concise title for a chat
async function generateChatTitle(firstPrompt, chatId) {
  try {
    const res = await fetch(getApiUrl('/api/generate-title'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: firstPrompt })
    });
    const data = await res.json();
    if (data.title && STATE.chats[chatId]) {
      STATE.chats[chatId].title = data.title;
      saveChatsToStorage();
    }
  } catch (err) {
    console.warn('Error fetching title:', err);
  }
}

// DOM Message Rendering
function appendMessageToDOM(role, text, image, index, isLiveStreaming = false) {
  const container = elements.messagesContainer;
  const row = document.createElement('div');
  row.className = `message-row ${role}`;
  row.dataset.index = index;

  let avatarHtml = '';
  if (role === 'assistant') {
    avatarHtml = `
      <div class="message-avatar assistant">
        <svg class="gemini-sparkle-avatar" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="gemini-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#4285f4"/>
              <stop offset="50%" stop-color="#9b72cb"/>
              <stop offset="100%" stop-color="#d96570"/>
            </linearGradient>
          </defs>
          <path fill="url(#gemini-icon-grad)" d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"/>
        </svg>
      </div>
    `;
  }

  let imageHtml = '';
  if (image && image.url) {
    imageHtml = `
      <div class="message-image-attachment">
        <img src="${image.url}" alt="User uploaded attachment">
      </div>
    `;
  }

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  const textDiv = document.createElement('div');
  textDiv.className = 'message-text';

  if (role === 'user') {
    textDiv.textContent = text;
  } else {
    textDiv.innerHTML = isLiveStreaming 
      ? '<span class="streaming-cursor"></span>' 
      : parseMarkdown(text);
  }

  bubble.innerHTML = imageHtml;
  bubble.appendChild(textDiv);

  if (role === 'assistant') {
    row.innerHTML = avatarHtml;
    row.appendChild(bubble);
    if (!isLiveStreaming && text) {
      attachAssistantActions(bubble, text, index);
    }
  } else {
    row.appendChild(bubble);
  }

  container.appendChild(row);
  return textDiv;
}

// Action buttons below assistant message
function attachAssistantActions(bubbleElement, fullText, msgIndex) {
  const existing = bubbleElement.querySelector('.message-actions-toolbar');
  if (existing) existing.remove();

  const toolbar = document.createElement('div');
  toolbar.className = 'message-actions-toolbar';

  // 1. Copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'msg-action-btn';
  copyBtn.title = 'Copy response';
  copyBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
  `;
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(fullText).then(() => {
      copyBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        `;
      }, 2000);
    });
  };

  // 2. Read Aloud (Text to Speech)
  const speakBtn = document.createElement('button');
  speakBtn.className = 'msg-action-btn';
  speakBtn.title = 'Listen to response';
  speakBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
  `;
  speakBtn.onclick = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('active');
        return;
      }

      const cleanSpeechText = fullText.replace(/[`*#_\[\]()!]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
      utterance.onend = () => speakBtn.classList.remove('active');
      utterance.onerror = () => speakBtn.classList.remove('active');
      speakBtn.classList.add('active');
      window.speechSynthesis.speak(utterance);
    }
  };

  // 3. Thumbs Up
  const likeBtn = document.createElement('button');
  likeBtn.className = 'msg-action-btn';
  likeBtn.title = 'Good response';
  likeBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
  `;
  likeBtn.onclick = () => {
    likeBtn.classList.toggle('active');
  };

  // 4. Regenerate Button
  const regenBtn = document.createElement('button');
  regenBtn.className = 'msg-action-btn';
  regenBtn.title = 'Regenerate response';
  regenBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
  `;
  regenBtn.onclick = () => {
    if (STATE.isStreaming) return;
    const currentChat = STATE.chats[STATE.currentChatId];
    if (!currentChat) return;
    const lastUserMsg = currentChat.messages.slice(0, msgIndex).reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      elements.promptInput.value = lastUserMsg.text;
      handleSubmitPrompt();
    }
  };

  toolbar.appendChild(copyBtn);
  toolbar.appendChild(speakBtn);
  toolbar.appendChild(likeBtn);
  toolbar.appendChild(regenBtn);

  bubbleElement.appendChild(toolbar);
}

// Markdown Parser with Image & Code Block Support
function parseMarkdown(md) {
  if (!md) return '';

  let html = md;

  // Preserve Images before escaping: ![alt](url)
  const images = [];
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const placeholder = `__IMG_TOKEN_${images.length}__`;
    images.push({ alt, url });
    return placeholder;
  });

  // Escape HTML tags to prevent XSS
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');

  // Code Blocks: ```lang \n code \n ```
  html = html.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const cleanLang = lang.trim() || 'code';
    const escapedCode = code.trim();
    const encodedCode = encodeURIComponent(code);

    return `
      <div class="code-block-wrapper">
        <div class="code-header">
          <span class="code-lang">${cleanLang}</span>
          <button class="copy-code-btn" onclick="copyCodeSnippet(this, '${encodedCode}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy code</span>
          </button>
        </div>
        <pre><code class="language-${cleanLang}">${escapedCode}</code></pre>
      </div>
    `;
  });

  // Restore Images
  images.forEach((img, idx) => {
    const placeholder = `__IMG_TOKEN_${idx}__`;
    html = html.replace(placeholder, `<div class="generated-image-box"><img src="${img.url}" alt="${img.alt}" loading="lazy"></div>`);
  });

  // Markdown links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--gemini-blue); text-decoration: underline;">$1</a>');

  // Inline Code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italics
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Lists (Unordered)
  html = html.replace(/^\s*[-*+]\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // Line breaks to paragraphs
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<div class="code-block') || p.startsWith('<div class="generated-image') || p.startsWith('<ul>') || p.startsWith('<blockquote>')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return html;
}

// Global copy handler for code snippets
window.copyCodeSnippet = function(button, encodedCode) {
  const code = decodeURIComponent(encodedCode);
  navigator.clipboard.writeText(code).then(() => {
    const textSpan = button.querySelector('span');
    const oldText = textSpan.textContent;
    textSpan.textContent = 'Copied!';
    button.style.color = '#66bb6a';

    setTimeout(() => {
      textSpan.textContent = oldText;
      button.style.color = '';
    }, 2000);
  });
};

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
