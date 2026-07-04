import { Request, Response } from 'express';
import { CouponModel } from '../models/Coupon';

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = CouponModel.getAll();
    res.status(200).json({ success: true, count: coupons.length, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;

    if (!code || !discountType || discountValue === undefined || !expiryDate) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    const codeUpper = code.toUpperCase();

    // Check duplicate
    const existing = CouponModel.findOne({ code: codeUpper });
    if (existing) {
      res.status(400).json({ success: false, message: 'Coupon code already exists' });
      return;
    }

    const coupon = CouponModel.create({
      code: codeUpper,
      discountType,
      discountValue: Number(discountValue),
      expiryDate,
      active: true
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const couponId = req.params.id;
    const existing = CouponModel.findById(couponId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    const { code, discountType, discountValue, expiryDate, active } = req.body;
    const updates: any = {};
    if (code) updates.code = code.toUpperCase();
    if (discountType) updates.discountType = discountType;
    if (discountValue !== undefined) updates.discountValue = Number(discountValue);
    if (expiryDate) updates.expiryDate = expiryDate;
    if (active !== undefined) updates.active = active === true || active === 'true';

    const updated = CouponModel.findByIdAndUpdate(couponId, updates);

    res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = CouponModel.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const applyCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Coupon code is required' });
      return;
    }

    const coupon = CouponModel.findOne({ code: code.toUpperCase(), active: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
      return;
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(coupon.expiryDate);
    if (expiry < now) {
      res.status(400).json({ success: false, message: 'This coupon code has expired' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon code applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
