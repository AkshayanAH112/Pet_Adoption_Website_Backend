import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Debug route to check current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user,
    message: 'Current authenticated user'
  });
});

export default router;
