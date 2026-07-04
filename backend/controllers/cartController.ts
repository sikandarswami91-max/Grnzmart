import { Response } from 'express';
import { CartModel } from '../models/Cart';
import { ProductModel } from '../models/Product';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const cart = CartModel.findOne(req.user.email);
    
    // Hydrate cart items with full product details
    const hydratedItems = cart.items.map((item) => {
      const product = ProductModel.findById(item.id);
      return {
        product,
        quantity: item.quantity
      };
    }).filter(item => item.product !== null); // remove deleted products

    res.status(200).json({
      success: true,
      cart: {
        user: cart.user,
        items: hydratedItems
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: 'Product ID required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Verify product exists and has stock
    const product = ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: 'Insufficient stock available' });
      return;
    }

    const cart = CartModel.findOne(req.user.email);
    const existingIndex = cart.items.findIndex((item) => item.id === productId);

    if (existingIndex !== -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (product.stock < newQty) {
        res.status(400).json({ success: false, message: 'Cannot add more. Insufficient stock.' });
        return;
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({ id: productId, quantity: Number(quantity) });
    }

    CartModel.save(req.user.email, cart.items);

    // Fetch full hydrated cart to return
    const hydratedItems = cart.items.map((item) => {
      const prod = ProductModel.findById(item.id);
      return {
        product: prod,
        quantity: item.quantity
      };
    }).filter(item => item.product !== null);

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: { user: cart.user, items: hydratedItems }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      res.status(400).json({ success: false, message: 'Product ID and quantity required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const product = ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
      return;
    }

    const cart = CartModel.findOne(req.user.email);
    const itemIndex = cart.items.findIndex((item) => item.id === productId);

    if (itemIndex === -1) {
      res.status(404).json({ success: false, message: 'Product not found in cart' });
      return;
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    CartModel.save(req.user.email, cart.items);

    const hydratedItems = cart.items.map((item) => {
      const prod = ProductModel.findById(item.id);
      return {
        product: prod,
        quantity: item.quantity
      };
    }).filter(item => item.product !== null);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: { user: cart.user, items: hydratedItems }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const cart = CartModel.findOne(req.user.email);
    cart.items = cart.items.filter((item) => item.id !== productId);
    CartModel.save(req.user.email, cart.items);

    const hydratedItems = cart.items.map((item) => {
      const prod = ProductModel.findById(item.id);
      return {
        product: prod,
        quantity: item.quantity
      };
    }).filter(item => item.product !== null);

    res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: { user: cart.user, items: hydratedItems }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    CartModel.clear(req.user.email);
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart: { user: req.user.email, items: [] }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
