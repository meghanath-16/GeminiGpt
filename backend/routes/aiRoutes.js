import express from 'express';
import {
  handleChatStream,
  handleGenerateImage,
  handleGenerateTitle,
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', handleChatStream);
router.post('/generate-image', handleGenerateImage);
router.post('/generate-title', handleGenerateTitle);

export default router;
