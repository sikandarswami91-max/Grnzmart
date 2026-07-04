import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../context/AppContext';
import { IProduct, ICategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const ShopView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Pagination & Filtering state derived from URL and local states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Local filter states
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Trigger loading categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Synchronize state with searchParams
  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'All';
    const sortParam = searchParams.get('sort') || 'latest';
    const minParam = searchParams.get('minPrice') || '';
    const maxParam = searchParams.get('maxPrice') || '';
    const pageParam = Number(searchParams.get('page')) || 1;

    setSelectedCategory(categoryParam);
    setSortBy(sortParam);
    setMinPrice(minParam);
    setMaxPrice(maxParam);
    setCurrentPage(pageParam);
  }, [searchParams]);

  // Fetch filtered products
  const fetchFilteredProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      const searchParam = searchParams.get('search');
      if (searchParam) queryParams.append('search', searchParam);
      
      if (selectedCategory !== 'All') {
        queryParams.append('category', selectedCategory);
      }
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      
      queryParams.append('sort', sortBy);
      queryParams.append('page', String(currentPage));
      queryParams.append('limit', '8');

      const res = await api.get(`/products?${queryParams.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch filtered products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, sortBy, minPrice, maxPrice, currentPage, searchParams]);

  // Handle category change
  const handleCategorySelect = (categoryName: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoryName === 'All') {
      params.delete('category');
    } else {
      params.set('category', categoryName);
    }
    params.set('page', '1'); // reset page on filter change
    setSearchParams(params);
  };

  // Handle Sort Change
  const handleSortSelect = (sortVal: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortVal);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Filter submit
  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    params.set('page', '1');
    setSearchParams(params);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  // Change Page
  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', String(pageNum));
    setSearchParams(params);
  };

  const searchTerm = searchParams.get('search');

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Title/Search Header */}
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">GenZmart Catalog</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {searchTerm ? (
              <span>
                Search results for "<span className="font-semibold text-blue-500">{searchTerm}</span>" ({totalCount} items found)
              </span>
            ) : (
              <span>Showing {totalCount} authentic high-quality items</span>
            )}
          </p>
        </div>

        {/* Filters and sorting row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <aside className="space-y-6 lg:col-span-1 bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 h-fit">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <span className="flex items-center gap-2 font-bold text-sm tracking-wide uppercase">
                <SlidersHorizontal className="h-4 w-4 text-blue-500" /> Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Categories list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Categories</h4>
              <div className="flex flex-col gap-1 text-sm font-medium">
                <button
                  onClick={() => handleCategorySelect('All')}
                  className={`px-3 py-2 rounded-xl text-left transition-colors ${
                    selectedCategory === 'All'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`px-3 py-2 rounded-xl text-left transition-colors ${
                      selectedCategory === cat.name
                        ? 'bg-blue-600 text-white font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Limit</h4>
              <form onSubmit={handlePriceFilterSubmit} className="space-y-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/60 text-sm px-3 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800/60 text-sm px-3 py-2 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                >
                  Apply Pricing
                </button>
              </form>
            </div>

            {/* Active search tag */}
            {searchTerm && (
              <div className="bg-blue-500/10 text-blue-500 text-xs p-3 rounded-2xl flex items-center justify-between border border-blue-500/20">
                <span className="truncate">Searching: "{searchTerm}"</span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete('search');
                    setSearchParams(params);
                  }}
                  className="hover:text-rose-500 transition-colors pl-2"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            )}
          </aside>

          {/* Product Grid and Sorting area */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Sort bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white dark:bg-slate-800/40 px-5 py-4 rounded-3xl border border-slate-100 dark:border-slate-800/60">
              <span className="text-xs text-slate-400">
                Showing <span className="text-slate-800 dark:text-white font-bold">{products.length}</span> of {totalCount} items
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortSelect(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-xs px-3 py-2 rounded-xl focus:outline-none border-none text-slate-800 dark:text-white"
                >
                  <option value="latest">Latest Drops</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products listings */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-slate-800/40 p-12 rounded-3xl border border-slate-100 dark:border-slate-800/60 text-center space-y-4">
                <p className="text-slate-400 font-medium">No products match your active filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-2xl text-xs hover:bg-blue-500"
                >
                  Reset Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-10 w-10 rounded-2xl text-xs font-bold transition-colors ${
                        currentPage === pNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};
