# Google Gemini MERN Fullstack Application 🚀

A fullstack **MERN** (MongoDB, Express, React, Node.js) implementation of **Google Gemini**, powered by the official `@google/genai` SDK and local **MongoDB** database for persistent conversation history.

---

## 🏗️ Project Architecture & File-wise Folder Structure

The project has been modularized file-wise into clean, dedicated directories:

```
sigmagpt/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection using Mongoose
│   │   └── modelsConfig.js       # Curated Google Gemini Free Tier models metadata
│   ├── models/
│   │   └── Chat.js               # Mongoose schema for chats & message history
│   ├── services/
│   │   └── geminiService.js      # GoogleGenAI streaming, vision, title, & image gen
│   ├── controllers/
│   │   ├── chatController.js     # MongoDB CRUD, past data sync & seeding
│   │   ├── aiController.js       # SSE chat stream & image synthesis handlers
│   │   └── modelController.js    # Health & free model list handlers
│   ├── routes/
│   │   ├── chatRoutes.js         # /api/chats endpoints
│   │   ├── aiRoutes.js           # /api/chat, /api/generate-image, /api/generate-title
│   │   └── modelRoutes.js        # /api/health, /api/models
│   ├── middleware/
│   │   └── errorHandler.js       # Central error handling & 404 middleware
│   ├── scripts/
│   │   └── seedData.js           # Database seed script for past conversation data
│   ├── server.js                 # Express server & static asset serving
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx              # Navigation header with model trigger
│   │   │   │   └── ModelSelectorModal.jsx  # Categorized modal with live quota badges
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx             # MongoDB chat history sidebar
│   │   │   │   ├── ChatListItem.jsx        # Individual chat item with actions
│   │   │   │   └── SettingsModal.jsx       # Custom persona & MongoDB management
│   │   │   └── Chat/
│   │   │       ├── ChatArea.jsx            # Dynamic message container
│   │   │       ├── ChatMessage.jsx         # Markdown, code blocks, TTS, copy tools
│   │   │       ├── ChatInput.jsx           # Multimodal image, speech dictation & send
│   │   │       ├── WelcomeHero.jsx         # Gemini greeting hero & quick suggestions
│   │   │       └── ImagePreview.jsx        # Multimodal image preview badge
│   │   ├── context/
│   │   │   ├── ChatContext.jsx             # Global chat state & MongoDB sync
│   │   │   └── ThemeContext.jsx            # Dark (Obsidian) & Google Light themes
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.js     # Voice-to-text dictation
│   │   │   └── useSpeechSynthesis.js       # AI voice playback
│   │   ├── services/
│   │   │   ├── api.js                      # Fetch/SSE client for backend & MongoDB
│   │   │   └── migration.js                # Auto-migrates browser localStorage to MongoDB
│   │   ├── styles/
│   │   │   ├── variables.css               # Design tokens & color palettes
│   │   │   └── index.css                   # Global styling, markdown, and animations
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
```

---

## 🗄️ MongoDB Integration & Past Data

- **Database**: `mongodb://127.0.0.1:27017/sigmagpt`
- **Past Conversations**: Automatically populated in MongoDB with topics:
  - *Quantum Computing Fundamentals* (`gemini-3.8-flash`)
  - *React 19 & Concurrent Mode* (`gemini-3.1-flash-lite`)
  - *Multimodal AI Architecture* (`gemini-3.7-flash`)
- **Auto Migration**: Any existing chat history from browser `localStorage` is automatically synced to MongoDB on startup.
- **Database Management**: The Settings modal includes one-click controls to seed historical past data or clear chats.

---

## ⚡ How to Run

### 1. Start MongoDB
Ensure MongoDB is running locally (default: `127.0.0.1:27017`).

### 2. Configure Backend `.env`
Edit [backend/.env](file:///d:/sigmagpt/backend/.env):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sigmagpt
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Seed Past Data (Optional)
```bash
cd backend
npm run seed
```

### 4. Start the Application
- **Production Mode (Single Port)**:
  ```bash
  cd backend
  npm start
  ```
  Open **[http://localhost:5000](http://localhost:5000)**.

- **Development Mode with Hot Reloading**:
  - In terminal 1 (Backend): `cd backend && npm run dev`
  - In terminal 2 (Frontend): `cd frontend && npm run dev`
  Open **[http://localhost:3000](http://localhost:3000)**.
