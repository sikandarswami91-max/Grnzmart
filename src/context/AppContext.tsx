import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { IUser, ICartItem, IProduct } from '../types';

// Create custom axios instance
export const api = axios.create({
  baseURL: '/api'
});

// Configure auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export interface IToast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ICouponInfo {
  code: string;
  discountType: 'percentage' | 'amount';
  discountValue: number;
}

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: IUser | null;
  token: string | null;
  loadingUser: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (name: string, profilePicture?: string) => Promise<any>;
  removeProfilePicture: () => Promise<any>;
  changePassword: (old: string, newPass: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (tok: string, newPass: string) => Promise<any>;
  
  cart: ICartItem[];
  loadingCart: boolean;
  getCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQty: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  wishlist: IProduct[];
  loadingWishlist: boolean;
  getWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  coupon: ICouponInfo | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  
  toasts: IToast[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    return savedTheme || 'dark';
  });
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  
  const [cart, setCart] = useState<ICartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  
  const [wishlist, setWishlist] = useState<IProduct[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState<boolean>(false);
  
  const [coupon, setCoupon] = useState<ICouponInfo | null>(null);
  const [toasts, setToasts] = useState<IToast[]>([]);

  // 1. Theme Management
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Toast Notifications
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 3. User Authentication
  const fetchUserProfile = async () => {
    try {
      setLoadingUser(true);
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Token is likely invalid or expired
      logout();
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoadingUser(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast('Welcome back, ' + res.data.user.name + '!', 'success');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        showToast('Account created successfully!', 'success');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    setCoupon(null);
    showToast('Logged out successfully', 'info');
  };

  const updateProfile = async (name: string, profilePicture?: string) => {
    try {
      const res = await api.put('/auth/profile', { name, profilePicture });
      if (res.data.success) {
        setUser(res.data.user);
        showToast('Profile updated successfully!', 'success');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Profile update failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const removeProfilePicture = async () => {
    try {
      const res = await api.delete('/auth/profile/picture');
      if (res.data.success) {
        if (user) {
          setUser({ ...user, profilePicture: '' });
        }
        showToast('Profile picture removed', 'info');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to remove picture';
      showToast(msg, 'error');
      throw error;
    }
  };

  const changePassword = async (old: string, newPass: string) => {
    try {
      const res = await api.put('/auth/password', { oldPassword: old, newPassword: newPass });
      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Password change failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        showToast('Mock email sent with reset instructions', 'info');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to request reset';
      showToast(msg, 'error');
      throw error;
    }
  };

  const resetPassword = async (tok: string, newPass: string) => {
    try {
      const res = await api.post('/auth/reset-password', { token: tok, newPassword: newPass });
      if (res.data.success) {
        showToast('Password reset complete. You can now login.', 'success');
        return res.data;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Password reset failed';
      showToast(msg, 'error');
      throw error;
    }
  };

  // 4. Cart Sync with Backend
  const getCart = async () => {
    if (!token) return;
    try {
      setLoadingCart(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart.items || []);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!token) {
      showToast('Please login to add items to cart', 'info');
      return;
    }
    try {
      setLoadingCart(true);
      const res = await api.post('/cart/add', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart.items);
        showToast('Product added to cart', 'success');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to add item';
      showToast(msg, 'error');
    } finally {
      setLoadingCart(false);
    }
  };

  const updateCartQty = async (productId: string, quantity: number) => {
    if (!token) return;
    try {
      const res = await api.put('/cart/update', { productId, quantity });
      if (res.data.success) {
        setCart(res.data.cart.items);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update quantity';
      showToast(msg, 'error');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!token) return;
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart.items);
        showToast('Item removed from cart', 'info');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to remove item';
      showToast(msg, 'error');
    }
  };

  const clearCart = async () => {
    if (!token) return;
    try {
      const res = await api.delete('/cart/clear');
      if (res.data.success) {
        setCart([]);
      }
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
    }
  };

  // 5. Wishlist Sync
  const getWishlist = async () => {
    if (!token) return;
    try {
      setLoadingWishlist(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!token) {
      showToast('Please login to use wishlist', 'info');
      return;
    }
    const alreadyIn = isInWishlist(productId);
    try {
      if (alreadyIn) {
        const res = await api.delete(`/wishlist/remove/${productId}`);
        if (res.data.success) {
          setWishlist(res.data.wishlist);
          showToast('Removed from wishlist', 'info');
        }
      } else {
        const res = await api.post('/wishlist/add', { productId });
        if (res.data.success) {
          setWishlist(res.data.wishlist);
          showToast('Added to wishlist!', 'success');
        }
      }
    } catch (error: any) {
      console.error('Wishlist toggle error:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // 6. Coupons
  const applyCoupon = async (code: string) => {
    if (!token) return;
    try {
      const res = await api.post('/coupons/apply', { code });
      if (res.data.success) {
        setCoupon(res.data.coupon);
        showToast('Coupon applied successfully!', 'success');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Coupon invalid or expired';
      showToast(msg, 'error');
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Initial Sync on Auth success
  useEffect(() => {
    if (token && user) {
      getCart();
      getWishlist();
    }
  }, [token, user]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        token,
        loadingUser,
        login,
        register,
        logout,
        updateProfile,
        removeProfilePicture,
        changePassword,
        forgotPassword,
        resetPassword,
        cart,
        loadingCart,
        getCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        wishlist,
        loadingWishlist,
        getWishlist,
        toggleWishlist,
        isInWishlist,
        coupon,
        applyCoupon,
        removeCoupon,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
