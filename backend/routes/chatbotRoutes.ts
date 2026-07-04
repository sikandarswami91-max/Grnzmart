import express from 'express';
import { chatbotController } from '../controllers/chatbotController';
import { protect, adminOnly } from '../middleware/authMiddleware';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'genzmart-super-secret-key-2026';

// Middleware to decode optional JWT token without throwing 401
const optionalAuth = (req: any, res: any, next: any) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = UserModel.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // Ignore invalid token and proceed anonymously
    }
  }
  next();
};

// Public route to get chat settings
router.get('/settings', chatbotController.getSettings);

// Public route to handle chat message (with optional user context)
router.post('/message', optionalAuth, chatbotController.handleMessage);

// Admin-only routes
router.put('/settings', protect, adminOnly, chatbotController.updateSettings);
router.get('/history', protect, adminOnly, chatbotController.getHistory);
router.delete('/history', protect, adminOnly, chatbotController.clearHistory);

export default router;
