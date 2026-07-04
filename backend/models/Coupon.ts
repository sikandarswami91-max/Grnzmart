import { readCollection, writeCollection } from '../config/db';

export interface ICoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  expiryDate: string;
  active: boolean;
  createdAt: string;
}

export const CouponModel = {
  getAll(): ICoupon[] {
    return readCollection<ICoupon>('coupons');
  },

  findOne(query: Partial<ICoupon>): ICoupon | null {
    const coupons = this.getAll();
    const found = coupons.find((c) => {
      return Object.entries(query).every(([key, value]) => c[key as keyof ICoupon] === value);
    });
    return found || null;
  },

  findById(id: string): ICoupon | null {
    const coupons = this.getAll();
    return coupons.find((c) => c.id === id) || null;
  },

  create(couponData: Omit<ICoupon, 'id' | 'createdAt'>): ICoupon {
    const coupons = this.getAll();
    const newCoupon: ICoupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    coupons.push(newCoupon);
    writeCollection('coupons', coupons);
    return newCoupon;
  },

  findByIdAndUpdate(id: string, updates: Partial<ICoupon>): ICoupon | null {
    const coupons = this.getAll();
    const index = coupons.findIndex((c) => c.id === id);
    if (index === -1) return null;

    delete updates.id;
    coupons[index] = { ...coupons[index], ...updates };
    writeCollection('coupons', coupons);
    return coupons[index];
  },

  delete(id: string): boolean {
    const coupons = this.getAll();
    const filtered = coupons.filter((c) => c.id !== id);
    if (filtered.length === coupons.length) return false;
    writeCollection('coupons', filtered);
    return true;
  }
};
