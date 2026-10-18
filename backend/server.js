import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Google GenAI client
const ai = new GoogleGenAI({});

// Serve static frontend assets
const frontendDir = path.resolve(__dirname, "../frontend");
app.use(express.static(frontendDir));

// Curated list of Free Models from the user's quota chart
const FREE_MODELS = [
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    category: "Flagship & Vision",
    rpm: "5",
    tpm: "250K",
    rpd: "20",
    badge: "Recommended",
    capabilities: ["Text", "Vision (Image-to-Text)", "Streaming", "Code"],
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
    capabilities: ["Text", "Vision (Image-to-Text)", "Ultra Fast"],
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

// Health / Status endpoint with all free model metadata
app.get("/api/health", (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    defaultModel: "gemini-3.8-flash",
    models: FREE_MODELS
  });
});

// Helper to format messages for Google GenAI SDK
function formatGeminiContents(messages) {
  return messages.map((msg) => {
    const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
    const parts = [];

    // Multimodal image (base64) attachment for image-to-text
    if (msg.image && msg.image.data) {
      parts.push({
        inlineData: {
          data: msg.image.data,
          mimeType: msg.image.mimeType || "image/png"
        }
      });
    }

    // Text part
    if (msg.text && msg.text.trim()) {
      parts.push({ text: msg.text });
    }

    return { role, parts };
  });
}

// Text-to-Image Generation endpoint
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required for image generation." });
  }

  try {
    // Generate clean descriptive prompt using Gemini first to enhance quality
    let enhancedPrompt = prompt;
    try {
      const enhanceRes = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Create a vivid, detailed, artistic visual prompt under 30 words for an image generator based on this idea: "${prompt}". Output ONLY the prompt string.`
      });
      if (enhanceRes.text && enhanceRes.text.trim()) {
        enhancedPrompt = enhanceRes.text.trim().replace(/["'\n\r]/g, "");
      }
    } catch (e) {
      // Fallback to original prompt
    }

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

    res.json({
      success: true,
      prompt,
      enhancedPrompt,
      imageUrl
    });
  } catch (err) {
    console.error("Image generation error:", err);
    res.status(500).json({ error: "Failed to generate image." });
  }
});

// Streaming Chat API endpoint (Server-Sent Events)
app.post("/api/chat", async (req, res) => {
  const { messages, model = "gemini-3.8-flash", systemInstruction } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const lastUserMsg = messages[messages.length - 1];

    // Check if user is using the image generation model OR explicitly requested image creation
    const isImageModel = model === "image-gen-nano";
    const promptText = (lastUserMsg?.text || "").toLowerCase();
    const isExplicitImagePrompt = isImageModel || (
      !lastUserMsg?.image && (
        promptText.startsWith("/image") ||
        promptText.startsWith("generate image of") ||
        promptText.startsWith("generate an image of") ||
        promptText.startsWith("create an image of") ||
        promptText.startsWith("draw an image of") ||
        promptText.startsWith("draw a ")
      )
    );

    if (isExplicitImagePrompt) {
      sendEvent({ type: "chunk", text: "🎨 *Crafting your image...*\n\n" });

      let cleanPrompt = lastUserMsg.text
        .replace(/^\/image\s*/i, "")
        .replace(/^generate an? image of\s*/i, "")
        .replace(/^create an? image of\s*/i, "")
        .replace(/^draw an? image of\s*/i, "")
        .replace(/^draw a\s*/i, "")
        .trim();

      if (!cleanPrompt) cleanPrompt = "A beautiful futuristic landscape with vibrant colors";

      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;

      const markdownImage = `![${cleanPrompt}](${imageUrl})\n\n**Prompt:** *${cleanPrompt}*\n\n[⬇️ View Full Resolution Image](${imageUrl})`;
      sendEvent({ type: "chunk", text: markdownImage });
      sendEvent({ type: "done" });
      return res.end();
    }

    // Normal text & multimodal vision handling with Gemini models
    const formattedContents = formatGeminiContents(messages);

    const config = {};
    if (systemInstruction && systemInstruction.trim()) {
      config.systemInstruction = systemInstruction.trim();
    }

    // Fallback if model is not suitable for vision
    let selectedModel = model;
    if (lastUserMsg?.image && selectedModel === "gemma-4-26b-a4b-it") {
      // Gemma doesn't accept image inputs, route to 3.1-flash-lite with 500 RPD
      selectedModel = "gemini-3.1-flash-lite";
    }

    const stream = await ai.models.generateContentStream({
      model: selectedModel || "gemini-3.8-flash",
      contents: formattedContents,
      ...(Object.keys(config).length > 0 ? { config } : {})
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        sendEvent({ type: "chunk", text });
      }
    }

    sendEvent({ type: "done" });
    res.end();
  } catch (error) {
    console.error("Gemini API Error:", error);
    sendEvent({
      type: "error",
      message: error.message || "An unexpected error occurred while communicating with Gemini."
    });
    res.end();
  }
});

// Title generation endpoint for new chat sessions
app.post("/api/generate-title", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.json({ title: "New Chat" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite", // Use high-quota 500 RPD model for titling
      contents: `Generate a concise 3 to 5 word title summarizing this user question or prompt. Output ONLY the title, no quotes or punctuation at the end: "${prompt.slice(0, 200)}"`
    });

    const cleanTitle = (response.text || "").replace(/["'\n\r]/g, "").trim() || "New Chat";
    res.json({ title: cleanTitle });
  } catch (err) {
    console.error("Error generating title:", err.message);
    const fallback = prompt.slice(0, 30).trim() + (prompt.length > 30 ? "..." : "");
    res.json({ title: fallback || "New Chat" });
  }
});

// Fallback to index.html for any frontend route
app.use((req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Restart listener on PORT
app.listen(PORT, () => {
  console.log(`✨ Google Gemini Clone Server running at http://localhost:${PORT}`);
});
