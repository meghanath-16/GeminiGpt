# Google Gemini Clone 🚀

A high-fidelity clone of **Google Gemini** powered by the official `@google/genai` SDK, featuring customized support for all models on your **Google AI Studio Free Tier**.

---

## ✨ Features

- **Redesigned Model Selector Popover**:
  - Interactive top-navigation trigger pill showing the current model and quota badge (`500 RPD`, `14.4K RPD`, `Recommended`).
  - Categorized tabs: **All Free Models**, **High Quota (500–14.4K)**, **Flagship & Logic**, and **Text-to-Image**.
  - Displays live quota metrics on each model card: **RPM**, **TPM**, and **RPD (Daily)**.
- **Active Free Tier Models Included**:
  - ⚡ **Gemini 3.1 Flash Lite**: 15 RPM • 250K TPM • **500 Requests/Day** *(Text + Vision)*
  - ⚡ **Gemini 3.5 Flash Lite**: 15 RPM • 250K TPM • **500 Requests/Day** *(Text + Vision)*
  - 🔥 **Gemma 4 26B**: 30 RPM • 16K TPM • **14,400 Requests/Day** *(High volume text)*
  - ⭐ **Gemini 3.8 Flash**: 5 RPM • 250K TPM • **20 Requests/Day** *(Flagship reasoning & multimodal)*
  - 🧠 **Gemini 3.7 Flash**: 5 RPM • 250K TPM • **20 Requests/Day** *(Deep reasoning)*
  - 🚀 **Gemini 3.6 Flash & Gemini 3 Flash**: 5 RPM • 250K TPM • **20 Requests/Day**
  - 📱 **Gemini 2.5 Flash Lite**: 10 RPM • 250K TPM • **20 Requests/Day**
  - 🎨 **Nano Banana / Imagen Generator**: Instant high-resolution text-to-image synthesis!
- **Multimodal Capabilities**:
  - **Image-to-Text (Vision)**: Upload or paste (`Ctrl+V`) screenshots, diagrams, and photos for instant visual analysis.
  - **Text-to-Image Generation**: Type `/image <prompt>` or click the **Create Image** quick pill to synthesize visuals in chat.
- **Flawless Light & Dark Modes**:
  - One-click toggle between Gemini Obsidian Dark Mode (`#131314`) and clean Google Light Mode.
- **Rich Streaming & Markdown**:
  - Real-time token streaming with syntax-highlighted code blocks, 1-click **Copy code** button, and speech synthesis text-to-speech.
- **Voice Dictation (Speech-to-Text)**:
  - Web Speech API microphone integration with live pulsing indicator.

---

## 🛠️ How to Run

1. Ensure [backend/.env](file:///d:/sigmagpt/backend/.env) contains your `GEMINI_API_KEY`.
2. Start the server:
   ```bash
   cd backend
   node server.js
   ```
3. Open your browser at **[http://localhost:5000](http://localhost:5000)**.
