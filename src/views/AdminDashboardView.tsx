import React, { useState, useEffect } from 'react';
import { useApp, api } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  TrendingUp, ShoppingBag, Users, Ticket, Plus, Pencil, Trash, Check, X, CheckCircle, Clock, Truck, Ban,
  Download, Bot
} from 'lucide-react';
import { IProduct, ICategory, IOrder, ICoupon } from '../types';

export const AdminDashboardView: React.FC = () => {
  const { user, token, showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'categories' | 'orders' | 'coupons' | 'chatbot'>('analytics');
  
  // Analytics State
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    salesHistory: [] as any[]
  });

  // Resource Lists
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Chatbot Admin States
  const [chatbotEnabled, setChatbotEnabled] = useState<boolean>(true);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [chatbotModel, setChatbotModel] = useState<string>('gemini-3.5-flash');
  const [chatbotTemperature, setChatbotTemperature] = useState<number>(0.7);
  const [chatbotSystemPrompt, setChatbotSystemPrompt] = useState<string>('');
  const [chatbotFaqs, setChatbotFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [mostAsked, setMostAsked] = useState<any[]>([]);
  const [loadingChatbot, setLoadingChatbot] = useState<boolean>(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState<string>('');
  const [newFaqAnswer, setNewFaqAnswer] = useState<string>('');

  const fetchChatbotAdminData = async () => {
    try {
      setLoadingChatbot(true);
      const settingsRes = await api.get('/chatbot/settings');
      if (settingsRes.data.success) {
        const s = settingsRes.data.settings;
        setChatbotEnabled(s.isEnabled);
        setWelcomeMessage(s.welcomeMessage);
        setChatbotModel(s.modelName || 'gemini-3.5-flash');
        setChatbotTemperature(s.temperature ?? 0.7);
        setChatbotSystemPrompt(s.systemPrompt);
        setChatbotFaqs(s.predefinedFAQs || []);
      }
      const historyRes = await api.get('/chatbot/history');
      if (historyRes.data.success) {
        setChatSessions(historyRes.data.sessions || []);
        setMostAsked(historyRes.data.mostAsked || []);
      }
    } catch (err) {
      console.error('Failed to fetch chatbot admin details:', err);
    } finally {
      setLoadingChatbot(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chatbot') {
      fetchChatbotAdminData();
    }
  }, [activeTab]);

  const handleSaveChatbotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/chatbot/settings', {
        isEnabled: chatbotEnabled,
        welcomeMessage,
        modelName: chatbotModel,
        temperature: chatbotTemperature,
        systemPrompt: chatbotSystemPrompt,
        predefinedFAQs: chatbotFaqs
      });
      if (res.data.success) {
        showToast('Chatbot configurations saved and synchronized successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save settings', 'error');
    }
  };

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      showToast('Both FAQ question and answer are required', 'error');
      return;
    }
    setChatbotFaqs(prev => [...prev, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    showToast('FAQ added! Click Save to apply changes.', 'info');
  };

  const handleDeleteFaq = (idx: number) => {
    setChatbotFaqs(prev => prev.filter((_, i) => i !== idx));
    showToast('FAQ deleted! Click Save to apply changes.', 'info');
  };

  const handleClearHistory = async () => {
    if (window.confirm('Clear all conversation histories? This cannot be undone.')) {
      try {
        const res = await api.delete('/chatbot/history');
        if (res.data.success) {
          setChatSessions([]);
          setMostAsked([]);
          showToast('Analytics logs cleared.', 'success');
        }
      } catch (err) {
        showToast('Failed to clear logs.', 'error');
      }
    }
  };

  const handleExportHistory = () => {
    try {
      const blob = new Blob([JSON.stringify(chatSessions, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `genzmart_chats_export_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Export complete!', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  // Form toggles/states for PRODUCTS
  const [isEditingProduct, setIsEditingProduct] = useState<boolean>(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    stock: 10,
    images: [] as string[],
    imageUrlInput: '',
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false
  });

  // Form for CATEGORY
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryImageInput, setCategoryImageInput] = useState('');

  // Form for COUPON
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(10);
  const [couponExpiry, setCouponExpiry] = useState('');

  // Verify Admin Access
  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      showToast('Unauthorized. Admin access only', 'error');
      navigate('/');
    }
  }, [user, token, navigate]);

  // Load resource data based on active tab
  const loadTabResource = async () => {
    try {
      setLoading(true);
      if (activeTab === 'analytics') {
        const res = await api.get('/orders/admin/analytics');
        if (res.data.success) {
          setStats(res.data.analytics);
        }
      } else if (activeTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?limit=100'),
          api.get('/categories')
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (catRes.data.success) setCategories(catRes.data.categories);
      } else if (activeTab === 'categories') {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } else if (activeTab === 'orders') {
        const res = await api.get('/orders/admin/all');
        if (res.data.success) setOrders(res.data.orders);
      } else if (activeTab === 'coupons') {
        const res = await api.get('/coupons');
        if (res.data.success) setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error('Failed to load administrative resource:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && token) {
      loadTabResource();
    }
  }, [activeTab, user, token]);

  // CATEGORY OPERATIONS
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryNameInput.trim()) return;
    try {
      const res = await api.post('/categories', {
        name: categoryNameInput,
        image: categoryImageInput || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
      });
      if (res.data.success) {
        showToast('Category created successfully!', 'success');
        setCategoryNameInput('');
        setCategoryImageInput('');
        loadTabResource();
      }
    } catch (err) {
      showToast('Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        showToast('Category deleted', 'info');
        loadTabResource();
      }
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  // COUPON OPERATIONS
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await api.post('/coupons', {
        code: couponCode.toUpperCase(),
        discountType: couponType,
        discountValue: couponValue,
        expiryDate: couponExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      if (res.data.success) {
        showToast('Discount Coupon activated!', 'success');
        setCouponCode('');
        setCouponExpiry('');
        loadTabResource();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      const res = await api.delete(`/coupons/${couponId}`);
      if (res.data.success) {
        showToast('Coupon deleted', 'info');
        loadTabResource();
      }
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  // ORDER OPERATIONS
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status });
      if (res.data.success) {
        showToast(`Order status updated to ${status}`, 'success');
        loadTabResource();
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  // PRODUCT OPERATIONS
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category) {
      showToast('Please fill out required fields', 'error');
      return;
    }

    const imagesToSubmit = productForm.images.length > 0 
      ? productForm.images 
      : [productForm.imageUrlInput || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'];

    const discountValue = Number(productForm.discount) || 0;
    const finalPrice = discountValue > 0 
      ? Number((productForm.originalPrice * (1 - discountValue / 100)).toFixed(2))
      : Number(productForm.originalPrice);

    const payload = {
      name: productForm.name,
      description: productForm.description,
      originalPrice: Number(productForm.originalPrice),
      price: finalPrice,
      discount: discountValue,
      category: productForm.category,
      stock: Number(productForm.stock),
      images: imagesToSubmit,
      isFeatured: productForm.isFeatured,
      isBestSeller: productForm.isBestSeller,
      isNewArrival: productForm.isNewArrival
    };

    try {
      if (editProductId) {
        // Edit Mode
        const res = await api.put(`/products/${editProductId}`, payload);
        if (res.data.success) {
          showToast('Product updated successfully!', 'success');
          resetProductForm();
          loadTabResource();
        }
      } else {
        // Create Mode
        const res = await api.post('/products', payload);
        if (res.data.success) {
          showToast('Product dropped successfully!', 'success');
          resetProductForm();
          loadTabResource();
        }
      }
    } catch (err: any) {
      showToast('Failed to save product settings', 'error');
    }
  };

  const handleEditProductClick = (prod: IProduct) => {
    setEditProductId(prod.id);
    setIsEditingProduct(true);
    setProductForm({
      name: prod.name,
      description: prod.description,
      originalPrice: prod.originalPrice,
      price: prod.price,
      discount: prod.discount,
      category: prod.category,
      stock: prod.stock,
      images: prod.images,
      imageUrlInput: prod.images[0] || '',
      isFeatured: prod.isFeatured || false,
      isBestSeller: prod.isBestSeller || false,
      isNewArrival: prod.isNewArrival || false
    });
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm('Delete this product? This action is irreversible.')) return;
    try {
      const res = await api.delete(`/products/${prodId}`);
      if (res.data.success) {
        showToast('Product deleted successfully', 'info');
        loadTabResource();
      }
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const resetProductForm = () => {
    setIsEditingProduct(false);
    setEditProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      stock: 10,
      images: [],
      imageUrlInput: '',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Operations</h1>
            <p className="text-xs text-slate-400">Manage products, orders, coupons, and check platform stats</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'products' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'coupons' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Coupons
          </button>
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'chatbot' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
            }`}
          >
            Chatbot
          </button>
        </div>

        {/* LOADING SCREEN */}
        {loading && (
          <p className="text-xs text-slate-400 animate-pulse py-12 text-center">Loading administrative module...</p>
        )}

        {/* TAB 1: ANALYTICS & CHARTS */}
        {!loading && activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Revenue</span>
                  <p className="text-2xl font-black">${stats.totalSales}</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Total Orders</span>
                  <p className="text-2xl font-black">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Registered Users</span>
                  <p className="text-2xl font-black">{stats.totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Platform Products</span>
                  <p className="text-2xl font-black">{stats.totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Ticket className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
              <h3 className="font-bold text-base mb-6">Revenue Analysis</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.salesHistory}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12 }} />
                    <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOG MANAGER */}
        {!loading && activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Product list - 7 columns */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800/60 pb-3 flex justify-between items-center">
                <span>Platform Drops ({products.length})</span>
                {!isEditingProduct && (
                  <button
                    onClick={() => setIsEditingProduct(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-2 rounded-xl text-xs flex items-center gap-1 transition-all"
                  >
                    <Plus className="h-4 w-4" /> Drop New
                  </button>
                )}
              </h3>

              <div className="space-y-3.5 max-h-[550px] overflow-y-auto pr-2">
                {products.map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                    <div className="flex gap-3 items-center">
                      <img src={prod.images[0]} alt="" referrerPolicy="no-referrer" className="h-12 w-12 rounded-xl object-cover bg-slate-100" />
                      <div>
                        <h4 className="font-bold text-xs line-clamp-1">{prod.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Category: {prod.category} | Stock: <span className="font-bold">{prod.stock}</span></p>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">${prod.price}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProductClick(prod)}
                        className="p-2 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                        title="Delete product"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form editor - 5 columns */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
                <h3 className="font-bold text-base">
                  {editProductId ? 'Edit Product Settings' : 'Drop New Streetwear'}
                </h3>
                {(isEditingProduct || editProductId) && (
                  <button onClick={resetProductForm} className="text-rose-500 p-1">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {isEditingProduct || editProductId ? (
                <form onSubmit={handleProductFormSubmit} className="space-y-4">
                  
                  {/* Name and Categories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category Drop *</label>
                      <select
                        required
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Product Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                    ></textarea>
                  </div>

                  {/* Prices & Stock */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Price ($) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                        className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Discount (%)</label>
                      <input
                        type="number"
                        value={productForm.discount}
                        onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                        className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stock qty *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                        className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Image input url */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Image URL</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.imageUrlInput}
                      onChange={(e) => setProductForm({ ...productForm, imageUrlInput: e.target.value })}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Flags */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 dark:border-slate-800/40">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      />
                      Featured
                    </label>
                    
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isBestSeller}
                        onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                      />
                      Best Seller
                    </label>

                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isNewArrival}
                        onChange={(e) => setProductForm({ ...productForm, isNewArrival: e.target.checked })}
                      />
                      New Drop
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md"
                  >
                    {editProductId ? 'Save settings' : 'Drop Streetwear'}
                  </button>

                </form>
              ) : (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <p className="text-xs">Select any product on the left to modify settings, or click Drop New.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: CATEGORIES LISTING & MANAGER */}
        {!loading && activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List categories */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800/60 pb-3">Available categories</h3>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between py-3.5 first:pt-0">
                    <div className="flex gap-3.5 items-center">
                      <img src={cat.image} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
                      <span className="font-bold text-sm">{cat.name}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Category form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
              <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Outerwear, Caps"
                    value={categoryNameInput}
                    onChange={(e) => setCategoryNameInput(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={categoryImageInput}
                    onChange={(e) => setCategoryImageInput(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold shadow-md"
                >
                  Create Category
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 4: ORDERS CONTROL */}
        {!loading && activeTab === 'orders' && (
          <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-6">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800/60 pb-3">Platform Orders ({orders.length})</h3>
            
            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No orders registered on the platform.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 text-left">Order ID</th>
                      <th className="pb-3">User</th>
                      <th className="pb-3">Grand Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Update Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100/50">
                        <td className="py-4">
                          <Link to={`/order-success/${ord.id}`} className="font-bold text-blue-500 hover:underline">{ord.id}</Link>
                          <p className="text-[9px] text-slate-400 mt-0.5">{new Date(ord.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 font-bold">{ord.userName || ord.user}</td>
                        <td className="py-4 font-black">${ord.totalPrice}</td>
                        <td className="py-4">
                          <span className={`inline-block font-black text-[9px] tracking-wider uppercase ${
                            ord.status === 'Cancelled' ? 'text-rose-500' :
                            ord.status === 'Delivered' ? 'text-emerald-500' : 'text-blue-500'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Shipped')}
                              className="p-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                              title="Mark Shipped"
                            >
                              <Truck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Delivered')}
                              className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors"
                              title="Mark Delivered"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOrderStatusChange(ord.id, 'Cancelled')}
                              className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                              title="Cancel Drop"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COUPONS & DISCOUNT MANAGEMENT */}
        {!loading && activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* List active coupons */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800/60 pb-3">Promo coupons</h3>
              
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {coupons.map((cop) => (
                  <div key={cop.id} className="flex items-center justify-between py-3.5 first:pt-0">
                    <div>
                      <span className="font-bold text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20">{cop.code}</span>
                      <p className="text-[10px] text-slate-400 mt-3 font-semibold">
                        Type: {cop.discountType} | Value: <span className="font-bold text-slate-800 dark:text-white">{cop.discountValue}{cop.discountType === 'percentage' ? '%' : '$'}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(cop.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Coupon form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
              <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">Add Promo Coupon</h3>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. SUMMER30"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 uppercase font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Type</label>
                    <select
                      value={couponType}
                      onChange={(e: any) => setCouponType(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash ($)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Discount Value *</label>
                    <input
                      type="number"
                      required
                      value={couponValue}
                      onChange={(e) => setCouponValue(Number(e.target.value))}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry date</label>
                  <input
                    type="date"
                    value={couponExpiry}
                    onChange={(e) => setCouponExpiry(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold shadow-md"
                >
                  Publish Promo Coupon
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 6: CHATBOT CONFIGURATION & ANALYTICS PANEL */}
        {!loading && activeTab === 'chatbot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
            
            {/* Left Panel: Settings & FAQs (Col span 7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* General Config Form */}
              <form onSubmit={handleSaveChatbotSettings} className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-4">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <span>🤖</span> AI Chatbot Settings
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold">Configure behavioral logic and model parameters</p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chatbotEnabled}
                      onChange={(e) => setChatbotEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {chatbotEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Welcome Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Welcome Message (En)</label>
                    <textarea
                      required
                      rows={3}
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Welcome greeting shown when the chat window is first opened"
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  {/* Model Name & Temperature */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Model</label>
                      <select
                        value={chatbotModel}
                        onChange={(e) => setChatbotModel(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature</label>
                        <span className="text-[10px] font-extrabold text-blue-500">{chatbotTemperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={chatbotTemperature}
                        onChange={(e) => setChatbotTemperature(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                      />
                    </div>
                  </div>

                  {/* System Prompt */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Prompt Instructions</label>
                    <textarea
                      required
                      rows={6}
                      value={chatbotSystemPrompt}
                      onChange={(e) => setChatbotSystemPrompt(e.target.value)}
                      placeholder="Define the behavior, tone, personality of your AI support specialist"
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 font-mono text-[10px] leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Save Chatbot Configurations
                </button>
              </form>

              {/* FAQ Builder */}
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <span>📋</span> Predefined FAQs Manager
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Add local, rapid Q&A pairs for prompt response offline fallbacks</p>
                </div>

                {/* FAQ List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {chatbotFaqs.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2 text-center font-bold">No predefined FAQs added yet.</p>
                  ) : (
                    chatbotFaqs.map((faq, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/40 flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">Q: {faq.question}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-bold">A: {faq.answer}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteFaq(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New FAQ Form */}
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New FAQ Question</label>
                    <input
                      type="text"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      placeholder="e.g. What is your standard shipping cost?"
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New FAQ Answer</label>
                    <textarea
                      rows={2}
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      placeholder="e.g. Standard shipping is $5, and free on orders over $100."
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddFaq}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    + Add Q&A To List
                  </button>
                </div>
              </div>

            </div>

            {/* Right Panel: Analytics & History (Col span 5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Analytics Summary */}
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base">📊 Chatbot Analytics</h3>
                    <p className="text-[10px] text-slate-400 font-bold">Session volume & engagement metrics</p>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={handleExportHistory}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      title="Export Chat History as JSON"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Clear All Chat Metrics"
                    >
                      <Trash className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Sessions</p>
                    <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{chatSessions.length}</h4>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Questions</p>
                    <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {chatSessions.reduce((sum, s) => sum + (s.messages ? s.messages.filter((m: any) => m.sender === 'user').length : 0), 0)}
                    </h4>
                  </div>
                </div>

                {/* Most Asked Queries Bar list */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Most Asked Topics</h4>
                  
                  {mostAsked.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic font-bold">No stats recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {mostAsked.map((item, idx) => {
                        const maxCount = Math.max(...mostAsked.map(m => m.count), 1);
                        const widthPct = Math.min(100, Math.round((item.count / maxCount) * 100));
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-700 dark:text-slate-300 capitalize">{item.question}</span>
                              <span className="text-blue-500">{item.count} hits</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                style={{ width: `${widthPct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Session Log */}
              <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-base">🕒 Live Chat Sessions Log</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Review real-time conversational transcripts</p>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {chatSessions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center font-bold">No chat sessions recorded yet.</p>
                  ) : (
                    chatSessions.map((session, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-[180px]">
                              {session.userEmail || 'Anonymous Guest'}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                              {new Date(session.updatedAt || Date.now()).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-500/15 text-blue-500 border border-blue-500/10 text-[9px] font-black rounded-md">
                            {session.messages ? session.messages.length : 0} msgs
                          </span>
                        </div>

                        {/* Expandable transcripts inline snippet */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 text-[10px] max-h-24 overflow-y-auto space-y-2 scrollbar-thin">
                          {session.messages && session.messages.slice(-3).map((m: any, mIdx: number) => (
                            <div key={mIdx} className="space-y-0.5 border-l-2 border-indigo-500 pl-1.5">
                              <span className="font-black text-[9px] uppercase tracking-wider text-slate-400">{m.sender}:</span>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold">{m.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
