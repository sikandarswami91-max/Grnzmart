import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist } = useApp();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <Heart className="h-10 w-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Your Wishlist is Empty</h2>
          <p className="text-slate-500 text-xs mt-1.5">You haven't favorited any streetwear drops yet. Browse our catalog and save your fits!</p>
        </div>
        <Link to="/shop" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-2xl text-xs shadow-md">
          Explore Streetwear
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Wishlist</h1>
            <p className="text-xs text-slate-400">Showing {wishlist.length} saved aesthetic drops</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 group">
            Continue Shopping <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

      </div>
    </div>
  );
};
