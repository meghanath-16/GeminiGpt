import Chat from '../models/Chat.js';

// Seed conversations representing rich past Gemini conversations
export const DEFAULT_PAST_CHATS = [
  {
    id: 'past-chat-quantum-computing',
    title: 'Quantum Computing Fundamentals',
    model: 'gemini-3.8-flash',
    systemInstruction: '',
    messages: [
      {
        id: 'msg-qc-1',
        role: 'user',
        text: 'Explain quantum superposition and entanglement in simple terms for a software engineer.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      },
      {
        id: 'msg-qc-2',
        role: 'model',
        text: '### Quantum Computing for Software Engineers\n\nThink of classical computing as working strictly with deterministic bits that hold a binary state: `0` or `1`.\n\n#### 1. Superposition: The Probabilistic State Space\n- In classical terms: A variable is either `let state = 0;` or `let state = 1;`.\n- In quantum terms: A **qubit** exists in a linear combination of states $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$.\n- While unmeasured, the qubit exists in a continuum of probabilities. Measuring it collapses the wave function to a concrete `0` or `1`.\n\n#### 2. Entanglement: Quantum Shared Memory\n- When two qubits become entangled, the state of one cannot be described independently of the other.\n- Even if separated across galaxies, measuring qubit A instantaneously determines qubit B with correlated probability.\n\n```python\n# Conceptual Qiskit Qubit Entanglement (Bell State)\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\nqc.h(0)       # Hadamard gate puts qubit 0 into superposition\nqc.cx(0, 1)   # CNOT gate entangles qubit 0 and qubit 1\n```',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48 + 3000),
      },
    ],
  },
  {
    id: 'past-chat-react-performance',
    title: 'React 19 & Concurrent Mode',
    model: 'gemini-3.1-flash-lite',
    systemInstruction: '',
    messages: [
      {
        id: 'msg-rp-1',
        role: 'user',
        text: 'What are the main performance advantages of React 19 Actions and useTransition?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: 'msg-rp-2',
        role: 'model',
        text: '### React 19 Actions & `useTransition` Highlights\n\n1. **Non-Blocking UI Updates**: Transitions tell React that a state update is non-urgent. If a user types into an input while a heavy list re-renders, the input stays fluid at 60 FPS.\n2. **Automatic Pending States**: Instead of creating manual `const [isPending, setIsPending] = useState(false)`, React automatically tracks asynchronous pending states.\n3. **Optimistic Updates**: Using `useOptimistic`, you can instantaneously render expected server response states before the HTTP round-trip finishes.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 2000),
      },
    ],
  },
  {
    id: 'past-chat-ai-multimodal',
    title: 'Multimodal AI Architecture',
    model: 'gemini-3.7-flash',
    systemInstruction: '',
    messages: [
      {
        id: 'msg-mm-1',
        role: 'user',
        text: 'How does Gemini process multimodal tokens natively compared to legacy pipeline approaches?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        id: 'msg-mm-2',
        role: 'model',
        text: 'Legacy architectures used disjoint models: an image captioning CNN/ViT converted pictures to text descriptions, then fed that text into an LLM. This suffered from massive informational bottlenecks.\n\n**Gemini\'s Native Multimodal Approach**:\n- Images, audio, and video are tokenized into the same high-dimensional embedding space alongside natural text.\n- Cross-attention operates natively across text and vision tokens.\n- Allows fine-grained spatial reasoning, OCR, and diagram comprehension without loss of visual context.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6 + 4000),
      },
    ],
  },
];

/**
 * Get all chats (ordered by most recent)
 */
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ updatedAt: -1 }).lean();
    res.json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chats from database' });
  }
};

/**
 * Get single chat by ID
 */
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findOne({ id }).lean();
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    res.json({ success: true, chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chat' });
  }
};

/**
 * Create a new chat session
 */
export const createChat = async (req, res) => {
  try {
    const { id, title = 'New Chat', model = 'gemini-3.8-flash', systemInstruction = '', messages = [] } = req.body;
    const chatId = id || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newChat = await Chat.create({
      id: chatId,
      title,
      model,
      systemInstruction,
      messages,
    });

    res.status(201).json({ success: true, chat: newChat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ success: false, error: 'Failed to create chat in database' });
  }
};

/**
 * Update an existing chat session (title, messages, model)
 */
export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, model, systemInstruction, messages } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (model !== undefined) updateFields.model = model;
    if (systemInstruction !== undefined) updateFields.systemInstruction = systemInstruction;
    if (messages !== undefined) updateFields.messages = messages;

    const updated = await Chat.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.json({ success: true, chat: updated });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ success: false, error: 'Failed to update chat in database' });
  }
};

/**
 * Delete a single chat
 */
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Chat.findOneAndDelete({ id });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }
    res.json({ success: true, message: 'Chat deleted successfully', id });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ success: false, error: 'Failed to delete chat' });
  }
};

/**
 * Clear all chats
 */
export const clearAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({});
    res.json({ success: true, message: 'All chats cleared successfully' });
  } catch (error) {
    console.error('Error clearing chats:', error);
    res.status(500).json({ success: false, error: 'Failed to clear chats' });
  }
};

/**
 * Bulk sync chats from client (e.g., migrating localStorage past data to MongoDB)
 */
export const bulkSyncChats = async (req, res) => {
  try {
    const { chats } = req.body;
    if (!chats || typeof chats !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid chats payload' });
    }

    const chatList = Array.isArray(chats) ? chats : Object.values(chats);
    const operations = chatList.map((chat) => ({
      updateOne: {
        filter: { id: chat.id },
        update: {
          $set: {
            id: chat.id,
            title: chat.title || 'New Chat',
            model: chat.model || 'gemini-3.8-flash',
            systemInstruction: chat.systemInstruction || '',
            messages: chat.messages || [],
            updatedAt: chat.updatedAt || new Date(),
          },
          $setOnInsert: {
            createdAt: chat.createdAt || new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Chat.bulkWrite(operations);
    }

    const allChats = await Chat.find().sort({ updatedAt: -1 }).lean();
    res.json({ success: true, message: `Synced ${operations.length} chats into MongoDB`, chats: allChats });
  } catch (error) {
    console.error('Error syncing past data to MongoDB:', error);
    res.status(500).json({ success: false, error: 'Failed to sync past data to MongoDB' });
  }
};

/**
 * Seed historical past data into MongoDB
 */
export const seedPastData = async (req, res) => {
  try {
    const count = await Chat.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.json({
        success: true,
        message: `Database already has ${count} chat sessions. Use ?force=true to overwrite.`,
      });
    }

    if (req.query.force) {
      await Chat.deleteMany({});
    }

    await Chat.insertMany(DEFAULT_PAST_CHATS);
    const chats = await Chat.find().sort({ updatedAt: -1 }).lean();

    res.json({
      success: true,
      message: 'Successfully populated MongoDB with past chat data!',
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error('Error seeding past data:', error);
    res.status(500).json({ success: false, error: 'Failed to seed past data to MongoDB' });
  }
};
