import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { IProduct } from '../types';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  product: IProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist, addToCart } = useApp();
  const isFavorite = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  return (
    <div className="group bg-white dark:bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Floating Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discount > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {product.discount}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            Best Seller
          </span>
        )}
        {product.isNewArrival && (
          <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            New
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 p-2 rounded-2xl shadow-md border backdrop-blur-md transition-all duration-300 ${
          isFavorite
            ? 'bg-rose-500 border-rose-500 text-white'
            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 hover:text-rose-500'
        }`}
      >
        <Heart className="h-4 w-4 fill-current" />
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category & Ratings */}
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-blue-500 font-semibold uppercase tracking-wider">{product.category}</span>
          <div className="flex items-center gap-1 text-amber-500 font-medium bg-amber-500/5 px-2 py-0.5 rounded-lg">
            <Star className="h-3 w-3 fill-current" />
            <span>{product.rating || '0.0'}</span>
          </div>
        </div>

        {/* Name */}
        <Link to={`/product/${product.id}`} className="hover:text-blue-500 transition-colors">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Pricing & CTA */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-50 dark:border-slate-800/40">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-50">${product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">${product.originalPrice}</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              {product.stock > 0 ? `${product.stock} in stock` : <span className="text-rose-500 font-semibold">Out of Stock</span>}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-3 rounded-2xl shadow-md transition-all duration-300 ${
              product.stock > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10 hover:-translate-y-0.5'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
