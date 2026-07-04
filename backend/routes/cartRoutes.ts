import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update', protect, updateCartItem);
router.delete('/remove/:productId', protect, removeCartItem);
router.delete('/clear', protect, clearCart);

export default router;
