import express from 'express';
import { getHealth, getModels } from '../controllers/modelController.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/models', getModels);

export default router;
