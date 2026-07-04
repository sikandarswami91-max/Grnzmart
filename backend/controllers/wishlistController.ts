import { Response } from 'express';
import { WishlistModel } from '../models/Wishlist';
import { ProductModel } from '../models/Product';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const wishlist = WishlistModel.findOne(req.user.email);
    const products = wishlist.productIds
      .map((id) => ProductModel.findById(id))
      .filter((p) => p !== null);

    res.status(200).json({ success: true, wishlist: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const addToWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const wishlist = WishlistModel.findOne(req.user.email);
    if (!wishlist.productIds.includes(productId)) {
      wishlist.productIds.push(productId);
      WishlistModel.save(req.user.email, wishlist.productIds);
    }

    const products = wishlist.productIds
      .map((id) => ProductModel.findById(id))
      .filter((p) => p !== null);

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: products
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const wishlist = WishlistModel.findOne(req.user.email);
    wishlist.productIds = wishlist.productIds.filter((id) => id !== productId);
    WishlistModel.save(req.user.email, wishlist.productIds);

    const products = wishlist.productIds
      .map((id) => ProductModel.findById(id))
      .filter((p) => p !== null);

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: products
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
