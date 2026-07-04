import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadProfilePicture,
  removeProfilePicture
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/password', protect, changePassword);
router.put('/password', protect, changePassword);
router.post('/profile/picture', protect, uploadProfilePicture);
router.delete('/profile/picture', protect, removeProfilePicture);

export default router;
