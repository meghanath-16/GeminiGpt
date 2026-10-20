import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { connectDB } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/chats', chatRoutes);
app.use('/api', aiRoutes);
app.use('/api', modelRoutes);

// Static frontend serving: checks for Vite built dist first, otherwise falls back to frontend dir
const distDir = path.resolve(__dirname, '../frontend/dist');
const rawFrontendDir = path.resolve(__dirname, '../frontend');

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else if (fs.existsSync(rawFrontendDir)) {
  app.use(express.static(rawFrontendDir));
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(rawFrontendDir, 'index.html'));
  });
}

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`✨ Gemini MERN Server running at http://localhost:${PORT}`);
});

export default app;
