import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AppContext';
import { IOrder } from '../types';
import { Check, Receipt, ShoppingBag, Truck, CheckCircle2, Package, Printer, AlertCircle } from 'lucide-react';

export const OrderSuccessView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to load order for invoice generation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 w-12 rounded-full mx-auto"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 w-48 rounded mx-auto"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-700 w-full rounded-3xl mt-12"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black">Invoice Not Found</h2>
        <p className="text-slate-500">Could not retrieve order details. Please check your order history.</p>
        <Link to="/profile" className="inline-block bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          My Order History
        </Link>
      </div>
    );
  }

  // Tracking timeline flags
  const isProcessing = true;
  const isShipped = order.status === 'Shipped' || order.status === 'Delivered';
  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Success Header Card */}
        <div className="bg-emerald-500/10 border border-emerald-500/15 p-8 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="bg-emerald-500 text-white p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto shadow-md">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">Order Placed Successfully!</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
              Thank you for shopping at GenZmart. Your order has been registered and is now processing.
            </p>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Order Reference: <span className="text-slate-900 dark:text-white font-black">{order.id}</span>
          </p>
        </div>

        {/* Shipping Tracker Timeline */}
        {!isCancelled ? (
          <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-6">
            <h3 className="font-bold text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Truck className="h-4.5 w-4.5 text-blue-500" /> Tracking Timeline
            </h3>

            <div className="grid grid-cols-3 relative">
              {/* Connector Lines */}
              <div className="absolute top-5 left-12 right-12 h-1 bg-slate-200 dark:bg-slate-800 z-0">
                <div
                  className={`h-full bg-blue-600 transition-all duration-500 ${
                    isDelivered ? 'w-full' : isShipped ? 'w-1/2' : 'w-0'
                  }`}
                />
              </div>

              {/* Step 1: Processing */}
              <div className="flex flex-col items-center text-center z-10 space-y-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                  isProcessing ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-slate-100 dark:bg-slate-950 border-slate-300'
                }`}>
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Processing</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">Under pack list</p>
                </div>
              </div>

              {/* Step 2: Shipped */}
              <div className="flex flex-col items-center text-center z-10 space-y-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                  isShipped ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-slate-100 dark:bg-slate-950 border-slate-300 text-slate-400'
                }`}>
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Shipped</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">En route to hub</p>
                </div>
              </div>

              {/* Step 3: Delivered */}
              <div className="flex flex-col items-center text-center z-10 space-y-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                  isDelivered ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-slate-100 dark:bg-slate-950 border-slate-300 text-slate-400'
                }`}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Delivered</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">At doorstep</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-3xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">Order Cancelled: This order drop has been officially cancelled and stock returned.</span>
          </div>
        )}

        {/* Invoice Area */}
        <div id="invoice-capture" className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-8">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <ShoppingBag className="h-4.5 w-4.5" />
                </div>
                <span className="text-lg font-black text-slate-950 dark:text-white">GenZmart Inc.</span>
              </div>
              <p className="text-[10px] text-slate-400">India</p>
              <p className="text-[10px] text-slate-400">sikandarswami91@gmail.com</p>
            </div>
            
            <div className="sm:text-right space-y-1">
              <h2 className="text-sm font-bold tracking-wide uppercase flex items-center sm:justify-end gap-1.5">
                <Receipt className="h-4 w-4 text-blue-500" /> E-Invoice
              </h2>
              <p className="text-[10px] text-slate-400">Invoice date: <span className="font-semibold text-slate-800 dark:text-slate-100">{new Date(order.createdAt).toLocaleDateString()}</span></p>
              <p className="text-[10px] text-slate-400">Payment method: <span className="font-semibold text-slate-800 dark:text-slate-100">{order.paymentMethod}</span></p>
              <p className="text-[10px] text-slate-400">Status: <span className={`font-black uppercase text-[10px] ${order.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>{order.isPaid ? 'PAID' : 'UNPAID'}</span></p>
            </div>
          </div>

          {/* Customer / Billing details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2">Billed To</h4>
              <p className="font-bold text-slate-800 dark:text-white">{order.userName}</p>
              <p className="text-slate-500 mt-0.5">{order.user}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2">Shipping Destination</h4>
              <p className="font-medium text-slate-800 dark:text-white">{order.shippingAddress.address}</p>
              <p className="text-slate-500 mt-0.5">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
              <p className="text-slate-500 mt-0.5">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Itemized list */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Itemized Drops</h4>
            
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[9px] font-black">
                  <th className="pb-3 w-3/5">Item description</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {order.orderItems.map((item) => (
                  <tr key={item.id} className="text-slate-600 dark:text-slate-300 font-medium">
                    <td className="py-4 flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded-lg object-cover bg-slate-100" />
                      )}
                      <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</span>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</td>
                    <td className="py-4 text-right">${item.price}</td>
                    <td className="py-4 text-right font-bold text-slate-900 dark:text-white">${item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Final invoice Pricing Breakdown */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6 flex justify-end text-xs font-semibold">
            <div className="w-full sm:w-1/2 space-y-2.5 text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-900 dark:text-white">${order.itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping charge</span>
                <span className="text-slate-900 dark:text-white">
                  {order.shippingPrice === 0 ? 'Free Shipping' : `$${order.shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span className="text-slate-900 dark:text-white">${order.taxPrice}</span>
              </div>
              {order.discountAmount !== undefined && order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Promo Code Discount ({order.couponCode})</span>
                  <span>-${order.discountAmount}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-4 border-t border-slate-100 dark:border-slate-800/60">
                <span>Total Billed Amount</span>
                <span>${order.totalPrice}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Floating actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Printer className="h-4 w-4" /> Print PDF Invoice
          </button>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Link
              to="/profile"
              className="flex-1 sm:flex-none text-center bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold px-6 py-3 rounded-2xl text-xs"
            >
              Order History
            </Link>
            <Link
              to="/shop"
              className="flex-1 sm:flex-none text-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-blue-500/10"
            >
              Back to Catalog
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
