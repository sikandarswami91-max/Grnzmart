import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Instagram, Twitter, MessageSquare, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast('Subscribed! Check your inbox for 20% off.', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      
      {/* Visual Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-500">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">Free Express Shipping</h4>
            <p className="text-xs text-slate-400">On all orders over $150. Delivers in 2-3 days.</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-500">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">30-Day Drip Return</h4>
            <p className="text-xs text-slate-400">No questions asked return and size exchange.</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-500">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">100% Secure Checkout</h4>
            <p className="text-xs text-slate-400">Integrated with Stripe & Razorpay certified processors.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Company Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              GenZ<span className="text-blue-500">mart</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Building the next-generation e-commerce destination. High-quality materials, sustainable street wear, and cutting-edge tech accessories.
          </p>
          <div className="flex gap-3 pt-2">
            <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors">
              <MessageSquare className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Links: Shop */}
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop Categories</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/shop?category=Footwear" className="hover:text-blue-400 transition-colors">Footwear Collection</Link></li>
            <li><Link to="/shop?category=Apparel" className="hover:text-blue-400 transition-colors">Apparel & Hoodies</Link></li>
            <li><Link to="/shop?category=Tech+Gadgets" className="hover:text-blue-400 transition-colors">Tech Gadgets</Link></li>
            <li><Link to="/shop?category=Accessories" className="hover:text-blue-400 transition-colors">Street Accessories</Link></li>
          </ul>
        </div>

        {/* Links: Info */}
        <div>
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Customer Support</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About GenZmart</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
            <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQ accordion</Link></li>
            <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy & Terms</a></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-2">Subscribe for 20% Off</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Join the GenZmart club and unlock exclusive drops, free early invites, and secret discount coupons.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-xl text-white transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Copy */}
      <div className="bg-slate-950 py-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 GenZmart Inc. All rights reserved.</p>
          <p>Designed with ❤️ for premium modern e-commerce</p>
        </div>
      </div>

    </footer>
  );
};
