export interface IReview {
  id: string;
  user: string; // email
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  reviews: IReview[];
  createdAt: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profilePicture?: string;
  createdAt: string;
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
}

export interface ICart {
  user: string;
  items: ICartItem[];
}

export interface IShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  id: string;
  user: string;
  userName: string;
  orderItems: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
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

export interface ICoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'amount';
  discountValue: number;
  expiryDate: string;
  active: boolean;
  createdAt: string;
}

export interface IDashboardAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  categorySales: { name: string; value: number }[];
  lowStockAlerts: { id: string; name: string; stock: number; price: number }[];
  salesHistory: { date: string; revenue: number; orders: number }[];
  recentOrders: IOrder[];
}
