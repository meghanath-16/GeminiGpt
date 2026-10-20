export const FREE_MODELS = [
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
