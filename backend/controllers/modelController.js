import { FREE_MODELS } from '../config/modelsConfig.js';

export const getHealth = (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  res.json({
    status: 'ok',
    hasApiKey: hasKey,
    defaultModel: 'gemini-3.8-flash',
    models: FREE_MODELS,
  });
};

export const getModels = (req, res) => {
  res.json({
    success: true,
    models: FREE_MODELS,
  });
};
