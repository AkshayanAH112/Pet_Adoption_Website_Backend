import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// All routes require authentication
router.use(authenticateToken);

// User profile route (for all authenticated users)
router.put('/profile', userController.updateUserProfile);

// User management routes (admin only)
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
