import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ChevronRight, Ticket, X, ShoppingBag } from 'lucide-react';

export const CartView: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, coupon, applyCoupon, removeCoupon, token } = useApp();
  const [couponInput, setCouponInput] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const tax = Number((subtotal * 0.1).toFixed(2)); // 10% tax

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

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const handleQtyAdjust = (productId: string, currentQty: number, maxStock: number, direction: 'up' | 'down') => {
    if (direction === 'up') {
      if (currentQty < maxStock) {
        updateCartQty(productId, currentQty + 1);
      }
    } else {
      if (currentQty > 1) {
        updateCartQty(productId, currentQty - 1);
      }
    }
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black">Your Cart is Locked</h2>
        <p className="text-slate-500">Sign in to sync, save, and access your shopping bag across all devices.</p>
        <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl text-xs">
          Sign In / Create Account
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Your Shopping bag is empty</h2>
          <p className="text-slate-500 text-xs mt-1.5">Go explore our latest releases to fill it with premium streetwear!</p>
        </div>
        <Link to="/shop" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl text-xs shadow-md">
          Shop Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <h1 className="text-3xl font-black tracking-tight">Shopping Bag ({cart.length} drops)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart items list - 8 columns */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white dark:bg-slate-800/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm flex flex-col sm:flex-row items-center gap-5 justify-between"
              >
                {/* Product image & name */}
                <div className="flex gap-4 items-center w-full sm:w-1/2">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} referrerPolicy="no-referrer" className="object-cover h-full w-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight hover:text-blue-500">
                      <Link to={`/product/${item.product.id}`}>{item.product.name}</Link>
                    </h3>
                    <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">{item.product.category}</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2">${item.product.price}</p>
                  </div>
                </div>

                {/* Adjust quantity controls */}
                <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl">
                  <button
                    onClick={() => handleQtyAdjust(item.product.id, item.quantity, item.product.stock, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQtyAdjust(item.product.id, item.quantity, item.product.stock, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Line Total and delete */}
                <div className="flex justify-between items-center sm:block text-right w-full sm:w-1/4">
                  <div className="sm:mb-2">
                    <p className="text-xs text-slate-400 font-medium sm:hidden">Total price:</p>
                    <p className="font-bold text-sm">${Number((item.product.price * item.quantity).toFixed(2))}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Pricing panel - 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promo coupon code submission */}
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Ticket className="h-4.5 w-4.5 text-blue-500" /> Apply Promo Code
              </h3>
              
              {coupon ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold">{coupon.code}</span> applied! 
                    <p className="text-[10px] text-emerald-500">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`} your order
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="hover:text-rose-500 p-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="GENZ20, WELCOME10..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-slate-900/60 text-xs px-3 py-2.5 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white uppercase text-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Total order computations */}
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-4">
              <h3 className="font-bold text-base pb-3 border-b border-slate-100 dark:border-slate-800/60">Order Summary</h3>
              
              <div className="space-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white">${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-slate-900 dark:text-white">
                    {shipping === 0 ? <span className="text-emerald-500 font-bold uppercase text-[10px]">Free Shipping</span> : `$${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (10%)</span>
                  <span className="text-slate-900 dark:text-white">${tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Coupon Discount</span>
                    <span>-${discount}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <span>Grand Total</span>
                  <span>${grandTotal}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl text-xs flex items-center justify-center gap-2 group transition-all duration-300 shadow-lg shadow-blue-500/10"
              >
                Proceed to Checkout
                <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
