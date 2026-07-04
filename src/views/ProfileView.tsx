import React, { useState, useEffect } from 'react';
import { useApp, api } from '../context/AppContext';
import { User, ShoppingBag, Lock, Camera, ChevronDown, ChevronUp, AlertCircle, XCircle } from 'lucide-react';
import { IOrder } from '../types';

export const ProfileView: React.FC = () => {
  const { user, token, updateUserProfile, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'password'>('profile');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  
  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Expanded historic order cards
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  // Load order history
  const fetchOrderHistory = async () => {
    try {
      setOrdersLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load order history list:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && token) {
      fetchOrderHistory();
    }
  }, [activeTab, token]);

  // Convert uploaded image to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Avatar image must be smaller than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setUpdatingProfile(true);
      const res = await api.put('/auth/profile', {
        name,
        profilePicture
      });

      if (res.data.success) {
        updateUserProfile(res.data.user);
        showToast('Profile credentials updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast('Failed to update profile details', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await api.put('/auth/profile/password', {
        currentPassword: oldPassword,
        newPassword
      });

      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password';
      showToast(msg, 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleOrderCancel = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order drop?')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        showToast('Order cancelled successfully', 'info');
        // Refresh orders list
        fetchOrderHistory();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to cancel order';
      showToast(msg, 'error');
    }
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <h2 className="text-2xl font-black">Authentication Required</h2>
        <p className="text-slate-500">Please sign in to view your dashboard settings.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <h1 className="text-3xl font-black tracking-tight">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Tab Menu Left: 3 columns */}
          <div className="lg:col-span-3 flex flex-col gap-2.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                activeTab === 'profile'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="h-4 w-4" /> Personal Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingBag className="h-4 w-4" /> Order History
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all text-left ${
                activeTab === 'password'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-800/40 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lock className="h-4 w-4" /> Reset Password
            </button>
          </div>

          {/* Active Tab Panel Right: 9 columns */}
          <div className="lg:col-span-9 bg-white dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
            
            {/* TAB 1: PROFILE EDIT */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                  {/* Photo selector */}
                  <div className="relative group">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-24 w-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-2xl uppercase">
                        {user?.name.charAt(0)}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 shadow-md transition-colors text-white">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold">Profile Avatar Image</h3>
                    <p className="text-xs text-slate-400 mt-1">Upload a PNG or JPG photo up to 2MB. Square crops work best.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-4 py-3 rounded-xl border border-transparent text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-colors"
                >
                  {updatingProfile ? 'Saving profile...' : 'Save Profile Settings'}
                </button>
              </form>
            )}

            {/* TAB 2: ORDER HISTORIES */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">My Order History ({orders.length})</h3>
                
                {ordersLoading ? (
                  <p className="text-xs text-slate-400 animate-pulse">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-slate-400 italic">No orders registered yet.</p>
                    <p className="text-[11px] text-slate-400">Go secure some fresh drops in the shop first!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const isExpanded = expandedOrderId === ord.id;
                      return (
                        <div
                          key={ord.id}
                          className="border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900/10 shadow-sm"
                        >
                          {/* Order Header */}
                          <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/40">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
                                <span className="font-bold text-slate-900 dark:text-white">{ord.id}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Placed On</span>
                                <span className="font-semibold">{new Date(ord.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Billed</span>
                                <span className="font-bold text-blue-500">${ord.totalPrice}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                                <span className={`inline-block font-black text-[9px] tracking-wider uppercase ${
                                  ord.status === 'Cancelled' ? 'text-rose-500' :
                                  ord.status === 'Delivered' ? 'text-emerald-500' : 'text-blue-500'
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2 items-center">
                              {/* Order success link */}
                              <a
                                href={`/order-success/${ord.id}`}
                                className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl border border-slate-700"
                              >
                                View Invoice
                              </a>

                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded content lists */}
                          {isExpanded && (
                            <div className="p-5 bg-white dark:bg-slate-900/40 border-t border-slate-50 dark:border-slate-800/30 space-y-4">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ordered Items</h4>
                              <div className="divide-y divide-slate-100 dark:divide-slate-800/40 space-y-3">
                                {ord.orderItems.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center pt-3 first:pt-0 text-xs">
                                    <div className="flex items-center gap-3">
                                      {item.image && (
                                        <img src={item.image} alt="" referrerPolicy="no-referrer" className="h-10 w-10 object-cover rounded-lg" />
                                      )}
                                      <div>
                                        <p className="font-bold">{item.name}</p>
                                        <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ${item.price}</p>
                                      </div>
                                    </div>
                                    <span className="font-bold">${item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Billing breakdown details */}
                              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 flex flex-col sm:flex-row justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 gap-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-[10px] text-slate-400 uppercase">Shipping Address</p>
                                  <p className="text-slate-800 dark:text-white">{ord.shippingAddress.address}, {ord.shippingAddress.city}</p>
                                  <p>{ord.shippingAddress.country} ({ord.shippingAddress.postalCode})</p>
                                </div>
                                <div className="space-y-1 sm:text-right">
                                  <p className="font-bold text-[10px] text-slate-400 uppercase">Summary Breakdown</p>
                                  <p>Items: ${ord.itemsPrice}</p>
                                  {ord.discountAmount && ord.discountAmount > 0 ? (
                                    <p className="text-emerald-500">Discount: -${ord.discountAmount}</p>
                                  ) : null}
                                  <p>Shipping: ${ord.shippingPrice}</p>
                                </div>
                              </div>

                              {/* Cancellation Trigger */}
                              {ord.status === 'Processing' && (
                                <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 flex justify-end">
                                  <button
                                    onClick={() => handleOrderCancel(ord.id)}
                                    className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/15 font-bold px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                  >
                                    <XCircle className="h-3.5 w-3.5" /> Cancel Order Drop
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PASSWORD UPDATING */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h3 className="text-lg font-bold">Change Account Password</h3>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Match new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-colors"
                >
                  {updatingPassword ? 'Changing password...' : 'Update Password'}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
