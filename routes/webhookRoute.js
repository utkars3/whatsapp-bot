import express from 'express';
import { webhookHandler } from '../controllers/webhookController.js';

const router = express.Router();
router.post('/webhook', webhookHandler);

export default router;
