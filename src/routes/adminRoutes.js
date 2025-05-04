import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// All routes require authentication
router.use(authenticateToken);

// Admin dashboard stats
router.get('/stats', userController.getAdminStats);

export default router;
