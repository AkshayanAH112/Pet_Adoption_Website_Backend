import express from 'express';
import { petMatchingQuiz } from '../controllers/matchingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/quiz', authenticateToken, petMatchingQuiz);

export default router;
