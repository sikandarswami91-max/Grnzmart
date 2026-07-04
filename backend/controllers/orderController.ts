import { Request, Response } from 'express';
import { OrderModel, IOrderItem } from '../models/Order';
import { ProductModel } from '../models/Product';
import { CouponModel } from '../models/Coupon';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const placeOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      couponCode,
      taxPrice = 0,
      shippingPrice = 0
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No order items' });
      return;
    }

    if (!shippingAddress) {
      res.status(400).json({ success: false, message: 'Please provide shipping address' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // 1. Validate stock and calculate items price
    let itemsPrice = 0;
    const validatedItems: IOrderItem[] = [];

    for (const item of orderItems) {
      const dbProduct = ProductModel.findById(item.id);
      if (!dbProduct) {
        res.status(400).json({ success: false, message: `Product ${item.name} not found` });
        return;
      }

      if (dbProduct.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Only ${dbProduct.stock} left.`
        });
        return;
      }

      itemsPrice += dbProduct.price * item.quantity;
      validatedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
        image: dbProduct.images[0]
      });
    }

    // 2. Validate and Apply Coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = CouponModel.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);
        if (expiry >= now) {
          if (coupon.discountType === 'percentage') {
            discountAmount = Number(((itemsPrice * coupon.discountValue) / 100).toFixed(2));
          } else {
            discountAmount = coupon.discountValue;
          }
          // Ensure discount doesn't exceed items price
          discountAmount = Math.min(discountAmount, itemsPrice);
        }
      }
    }

    const totalPrice = Number((itemsPrice + taxPrice + shippingPrice - discountAmount).toFixed(2));

    // 3. Create the Order
    const order = OrderModel.create({
      user: req.user.email,
      userName: req.user.name,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      discountAmount
    });

    // 4. Deduct Product Stock
    for (const item of validatedItems) {
      const dbProduct = ProductModel.findById(item.id)!;
      ProductModel.findByIdAndUpdate(item.id, {
        stock: dbProduct.stock - item.quantity
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const orders = OrderModel.find({ user: req.user.email });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = OrderModel.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Authorization check
    if (req.user?.role !== 'admin' && order.user !== req.user?.email) {
      res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = OrderModel.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Auth check
    if (req.user?.role !== 'admin' && order.user !== req.user?.email) {
      res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
      return;
    }

    if (order.status !== 'Processing') {
      res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.status}`
      });
      return;
    }

    // 1. Cancel order status
    const updated = OrderModel.findByIdAndUpdate(req.params.id, { status: 'Cancelled' });

    // 2. Return product inventory back to products!
    if (updated) {
      for (const item of updated.orderItems) {
        const product = ProductModel.findById(item.id);
        if (product) {
          ProductModel.findByIdAndUpdate(item.id, {
            stock: product.stock + item.quantity
          });
        }
      }
    }

    res.status(200).json({ success: true, message: 'Order cancelled successfully', order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Admin Endpoints
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = OrderModel.getAll();
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = OrderModel.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const updates: any = { status };

    if (status === 'Delivered') {
      updates.isDelivered = true;
      updates.deliveredAt = new Date().toISOString();
      updates.isPaid = true; // Delivered order should definitely be paid
      if (!order.isPaid) {
        updates.paidAt = new Date().toISOString();
      }
    }

    const updated = OrderModel.findByIdAndUpdate(req.params.id, updates);

    res.status(200).json({ success: true, message: 'Order status updated successfully', order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = OrderModel.getAll();
    const products = ProductModel.getAll();
    const users = UserModel.getAll();

    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalUsers = users.length;

    // Filter cancelled out from revenue
    const paidRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // Sales by Category
    const categorySalesMap: Record<string, number> = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((o) => {
        o.orderItems.forEach((item) => {
          // Find category of product
          const prod = products.find((p) => p.id === item.id);
          const cat = prod ? prod.category : 'General';
          categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.price * item.quantity;
        });
      });

    const categorySales = Object.entries(categorySalesMap).map(([name, value]) => ({
      name,
      value: Math.round(value)
    }));

    // Stock alert products
    const lowStockAlerts = products.filter((p) => p.stock <= 5).map((p) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      price: p.price
    }));

    // Sales charts: group by last 7 days or date
    const dailySalesMap: Record<string, { revenue: number; orders: number }> = {};
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      last7Days.push(dateString);
      dailySalesMap[dateString] = { revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const dateString = o.createdAt.split('T')[0];
      if (dailySalesMap[dateString] !== undefined && o.status !== 'Cancelled') {
        dailySalesMap[dateString].revenue += o.totalPrice;
        dailySalesMap[dateString].orders += 1;
      }
    });

    const salesHistory = last7Days.map((date) => {
      const d = new Date(date);
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        revenue: Math.round(dailySalesMap[date].revenue),
        orders: dailySalesMap[date].orders
      };
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue: Math.round(paidRevenue),
        totalOrders,
        totalProducts,
        totalUsers,
        categorySales,
        lowStockAlerts,
        salesHistory,
        recentOrders: orders.slice(-5).reverse()
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
