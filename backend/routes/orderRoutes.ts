import { Router } from 'express';
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getDashboardAnalytics
} from '../controllers/orderController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, placeOrder);

// Define specific/static routes BEFORE the parameterized /:id route to prevent pattern matching issues
router.get('/my-orders', protect, getMyOrders);
router.get('/my', protect, getMyOrders);
router.get('/admin/analytics', protect, adminOnly, getDashboardAnalytics);
router.get('/analytics', protect, adminOnly, getDashboardAnalytics);
router.get('/admin/all', protect, adminOnly, getAllOrders);

router.get('/:id', protect, getOrderById);

// Support both POST and PUT for cancel order endpoint
router.post('/:id/cancel', protect, cancelOrder);
router.put('/:id/cancel', protect, cancelOrder);

// Admin-only order controls
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
