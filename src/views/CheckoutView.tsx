import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, api } from '../context/AppContext';
import { CreditCard, Truck, AlertCircle, ShoppingBag } from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { cart, coupon, clearCart, user, showToast } = useApp();
  const navigate = useNavigate();

  // Shipping form inputs
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  
  // Payment methods
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Razorpay' | 'COD'>('COD');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 15;
  const tax = Number((subtotal * 0.1).toFixed(2));

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const grandTotal = Number((subtotal + shipping + tax - discount).toFixed(2));

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      showToast('Please fill out all shipping address fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const orderData = {
        orderItems: cart.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        })),
        shippingAddress: { address, city, postalCode, country },
        paymentMethod,
        couponCode: coupon?.code,
        taxPrice: tax,
        shippingPrice: shipping
      };

      const res = await api.post('/orders', orderData);

      if (res.data.success) {
        showToast('Order placed successfully!', 'success');
        const orderId = res.data.order.id;
        
        // Clear local cart
        await clearCart();
        
        // Navigate to invoice
        navigate(`/order-success/${orderId}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to place order';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <h1 className="text-3xl font-black tracking-tight mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form fields: 7 columns */}
          <form onSubmit={handleOrderSubmit} className="lg:col-span-7 space-y-6">
            
            {/* Shipping details */}
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <Truck className="h-4.5 w-4.5 text-blue-500" /> Shipping Details
              </h3>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipient Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full bg-slate-100 dark:bg-slate-800/60 text-xs px-3 py-2.5 rounded-xl border border-transparent text-slate-500 cursor-not-allowed"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="123 Cyberpunk Alley, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/60 text-xs px-3 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      placeholder="New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800/60 text-xs px-3 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="10001"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800/60 text-xs px-3 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800/60 text-xs px-3 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method details */}
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <CreditCard className="h-4.5 w-4.5 text-blue-500" /> Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-blue-600 bg-blue-500/5 text-blue-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs">Cash on Delivery</p>
                  <p className="text-[9px] text-slate-400 mt-1">Pay with cash upon arrival</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Stripe')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'Stripe'
                      ? 'border-blue-600 bg-blue-500/5 text-blue-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs">Credit Card (Stripe)</p>
                  <p className="text-[9px] text-slate-400 mt-1">Simulated Stripe payment</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'Razorpay'
                      ? 'border-blue-600 bg-blue-500/5 text-blue-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs">UPI/Wallet (Razorpay)</p>
                  <p className="text-[9px] text-slate-400 mt-1">Simulated Razorpay wallet</p>
                </button>
              </div>

              {paymentMethod !== 'COD' && (
                <div className="bg-blue-500/5 border border-blue-500/10 text-xs text-blue-500 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <span className="font-bold">Sandbox Mode:</span> Payment gateways will run in fully integrated secure simulation. Cards will be processed instantly.
                  </div>
                </div>
              )}
            </div>

            {/* Complete order button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-xs transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Creating Secure Order...' : `Place Secure Order ($${grandTotal})`}
            </button>

          </form>

          {/* Checkout items summary column - 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <ShoppingBag className="h-4.5 w-4.5 text-blue-500" /> Order Drops
              </h3>
              
              {/* Items lists */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-slate-800/40">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 pt-3 items-center justify-between first:pt-0">
                    <div className="flex gap-2.5 items-center">
                      <img src={item.product.images[0]} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-xl object-cover bg-slate-100" />
                      <div>
                        <p className="font-bold text-xs truncate max-w-[150px]">{item.product.name}</p>
                        <p className="text-[9px] text-slate-400">Qty: {item.quantity} × ${item.product.price}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold">${item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-slate-900 dark:text-white">
                    {shipping === 0 ? <span className="text-emerald-500 font-bold uppercase text-[9px]">Free</span> : `$${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span className="text-slate-900 dark:text-white">${tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Discount Coupon</span>
                    <span>-${discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <span>Total Due</span>
                  <span>${grandTotal}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
