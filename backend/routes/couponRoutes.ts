import { Router } from 'express';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} from '../controllers/couponController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Public / User coupon validation
router.post('/apply', protect, applyCoupon);

// Admin-only coupon CRUD
router.get('/', protect, adminOnly, getCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id', protect, adminOnly, updateCoupon);
router.delete('/:id', protect, adminOnly, deleteCoupon);

export default router;
