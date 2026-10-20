import express from 'express';
import {
  getAllChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat,
  clearAllChats,
  bulkSyncChats,
  seedPastData,
} from '../controllers/chatController.js';

const router = express.Router();

// Chat collection routes
router.get('/', getAllChats);
router.post('/', createChat);
router.delete('/', clearAllChats);

// Past data sync & seeding routes
router.post('/sync', bulkSyncChats);
router.post('/seed', seedPastData);
router.get('/seed', seedPastData);

// Single chat item routes
router.get('/:id', getChatById);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);

export default router;
