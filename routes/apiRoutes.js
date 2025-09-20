import express from 'express';
import { listByUser, wipe } from '../controllers/apiController.js';

const router = express.Router();
router.get('/expenses', listByUser);
router.post('/wipe', wipe);

export default router;
