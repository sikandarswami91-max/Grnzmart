import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp, api } from '../context/AppContext';
import { IProduct } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Star, ShieldCheck, Heart, ShoppingBag, Plus, Minus, Send, Trash } from 'lucide-react';

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, addToCart, toggleWishlist, isInWishlist, showToast } = useApp();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [related, setRelated] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Gallery and purchase controls
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  // Review inputs
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Recently Viewed state saved in localStorage
  const [recentlyViewed, setRecentlyViewed] = useState<IProduct[]>([]);

  const fetchProductDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        const prod = res.data.product;
        setProduct(prod);
        setRelated(res.data.related || []);
        setActiveImage(prod.images[0]);
        setQuantity(1);

        // Update recently viewed
        updateRecentlyViewed(prod);
      }
    } catch (err: any) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRecentlyViewed = (currentProd: IProduct) => {
    try {
      const stored = localStorage.getItem('recently_viewed');
      let viewedList: IProduct[] = stored ? JSON.parse(stored) : [];
      
      // Filter out duplicate if it exists, insert at front, limit to 4
      viewedList = viewedList.filter((p) => p.id !== currentProd.id);
      viewedList.unshift(currentProd);
      viewedList = viewedList.slice(0, 4);
      
      localStorage.setItem('recently_viewed', JSON.stringify(viewedList));
      setRecentlyViewed(viewedList.filter((p) => p.id !== currentProd.id)); // exclude current page from bottom tracker
    } catch (err) {
      console.error('Failed to update recently viewed history:', err);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    // Load recently viewed for UI
    try {
      const stored = localStorage.getItem('recently_viewed');
      if (stored && product) {
        const viewedList: IProduct[] = JSON.parse(stored);
        setRecentlyViewed(viewedList.filter((p) => p.id !== product.id));
      }
    } catch (err) {}
  }, [product]);

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (!product) return;
    if (type === 'inc') {
      if (quantity < product.stock) {
        setQuantity(quantity + 1);
      } else {
        showToast('Max available stock reached', 'info');
      }
    } else {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a review', 'info');
      return;
    }
    if (!commentInput.trim()) {
      showToast('Review comment cannot be empty', 'info');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/products/${id}/reviews`, {
        rating: ratingInput,
        comment: commentInput
      });

      if (res.data.success) {
        setProduct(res.data.product);
        setCommentInput('');
        setRatingInput(5);
        showToast('Review added! Thank you for the feedback.', 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!product) return;
    try {
      const res = await api.delete(`/products/${product.id}/reviews/${reviewId}`);
      if (res.data.success) {
        setProduct(res.data.product);
        showToast('Review deleted successfully', 'info');
      }
    } catch (error: any) {
      showToast('Failed to delete review', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[400px] bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-black">Drop Not Found</h2>
        <p className="text-slate-500">This product does not exist in our catalog or has been removed.</p>
        <Link to="/shop" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* Breadcrumb */}
        <div className="text-xs text-slate-400 font-medium flex gap-2">
          <Link to="/" className="hover:text-blue-500">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-blue-500">Catalog</Link>
          <span>/</span>
          <span className="text-slate-600 dark:text-slate-200 font-bold truncate max-w-[150px]">{product.name}</span>
        </div>

        {/* Product core specs grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Gallery - 5 columns */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Stage Image */}
            <div className="bg-white dark:bg-slate-800/40 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/60 shadow-md aspect-square flex items-center justify-center relative group">
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              />
              {product.stock <= 5 && product.stock > 0 && (
                <span className="absolute bottom-4 left-4 bg-amber-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Only {product.stock} Left in Stock
                </span>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-blue-600 scale-105' : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="object-cover h-full w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details - 7 columns */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{product.category}</span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{product.name}</h1>
              
              {/* Reviews score summary */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-lg text-sm font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{product.rating || '0.0'}</span>
                </div>
                <span className="text-xs text-slate-400">({product.numReviews} customer reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="bg-white dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/60 flex justify-between items-center shadow-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Price drop</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">${product.price}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-base text-slate-400 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
              
              {product.discount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  Save {product.discount}%
                </span>
              )}
            </div>

            {/* Product description */}
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Trust highlights */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/40 px-4 py-3 rounded-2xl">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
                <span>Genuine Dropped Product</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/40 px-4 py-3 rounded-2xl">
                <ShoppingBag className="h-4.5 w-4.5 text-blue-500" />
                <span>Express Delivery Enabled</span>
              </div>
            </div>

            {/* Purchasing interactions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
              
              {/* Quantity selector */}
              {product.stock > 0 && (
                <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 px-4 py-2 rounded-2xl w-full sm:w-fit gap-6 shadow-sm">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Qty</span>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQtyChange('dec')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQtyChange('inc')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Main CTA */}
              <div className="flex gap-3 flex-1">
                <button
                  onClick={() => addToCart(product.id, quantity)}
                  disabled={product.stock <= 0}
                  className={`flex-1 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                    product.stock > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/15 hover:-translate-y-0.5'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {product.stock > 0 ? 'Add to Cart Bag' : 'Out of Stock'}
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isFavorite
                      ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="space-y-8 border-t border-slate-100 dark:border-slate-800/60 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Review stats and submit: 5 columns */}
            <div className="lg:col-span-5 space-y-6 bg-white dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
              <h3 className="text-lg font-bold">Write a Customer Review</h3>
              
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="text-amber-500 focus:outline-none"
                        >
                          <Star className={`h-6 w-6 ${ratingInput >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment box */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Review Comment</label>
                    <textarea
                      placeholder="Loved the fit! The neon styling is exactly what I wanted..."
                      rows={4}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full bg-slate-100 dark:bg-slate-800/60 text-sm px-4 py-3 rounded-2xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {submittingReview ? 'Submitting Review...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center p-4">
                  <p className="text-xs text-slate-400 mb-3">You must be logged in to leave product reviews.</p>
                  <Link
                    to="/login"
                    className="inline-block bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>

            {/* Reviews Feed: 7 columns */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-lg font-bold">Reviews ({product.reviews.length})</h3>
              
              {product.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No customer reviews yet. Be the first to drop one!</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-white dark:bg-slate-800/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40 relative flex gap-4 items-start shadow-sm"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                        {rev.userName ? rev.userName.charAt(0) : rev.user.charAt(0)}
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold">{rev.userName || rev.user}</h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-lg text-xs font-bold">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                          {rev.comment}
                        </p>
                      </div>

                      {/* Delete review button (visible to reviewer or admin only) */}
                      {user && (user.role === 'admin' || user.email === rev.user) && (
                        <button
                          onClick={() => handleReviewDelete(rev.id)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors self-start"
                          title="Delete Review"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Related Products Grid */}
        {related.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-2xl font-black">Related Drops</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="space-y-6 border-t border-slate-100 dark:border-slate-800/60 pt-12">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Recently Viewed</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentlyViewed.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
