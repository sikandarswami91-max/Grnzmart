import { readCollection, writeCollection } from '../config/db';

export interface IOrderItem {
  id: string; // product id
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  id: string;
  user: string; // user email
  userName: string;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'Stripe' | 'Razorpay' | 'COD';
  paymentResult?: {
    id?: string;
    status?: string;
    email_address?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  couponCode?: string;
  discountAmount?: number;
  createdAt: string;
}

export const OrderModel = {
  getAll(): IOrder[] {
    return readCollection<IOrder>('orders');
  },

  find(query: Partial<IOrder>): IOrder[] {
    const orders = this.getAll();
    return orders.filter((o) => {
      return Object.entries(query).every(([key, value]) => o[key as keyof IOrder] === value);
    });
  },

  findById(id: string): IOrder | null {
    const orders = this.getAll();
    const found = orders.find((o) => o.id === id);
    return found || null;
  },

  create(orderData: Omit<IOrder, 'id' | 'createdAt' | 'status' | 'isPaid' | 'isDelivered'>): IOrder {
    const orders = this.getAll();
    const newOrder: IOrder = {
      ...orderData,
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'Processing',
      isPaid: orderData.paymentMethod !== 'COD', // COD is unpaid, others paid instantly
      paidAt: orderData.paymentMethod !== 'COD' ? new Date().toISOString() : undefined,
      isDelivered: false,
      createdAt: new Date().toISOString()
    };
    orders.push(newOrder);
    writeCollection('orders', orders);
    return newOrder;
  },

  findByIdAndUpdate(id: string, updates: Partial<IOrder>): IOrder | null {
    const orders = this.getAll();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    delete updates.id;
    orders[index] = { ...orders[index], ...updates };
    writeCollection('orders', orders);
    return orders[index];
  }
};
