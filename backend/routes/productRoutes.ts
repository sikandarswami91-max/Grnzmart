import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  deleteProductReview
} from '../controllers/productController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only product management
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Reviews
router.post('/:id/reviews', protect, addProductReview);
router.delete('/:productId/reviews/:reviewId', protect, deleteProductReview);

export default router;
