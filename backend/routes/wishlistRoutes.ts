import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getWishlist);
router.post('/add', protect, addToWishlist);
router.delete('/remove/:productId', protect, removeFromWishlist);

export default router;
