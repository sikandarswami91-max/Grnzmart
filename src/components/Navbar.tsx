import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, api } from '../context/AppContext';
import {
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  LayoutDashboard,
  Compass,
  Info,
  HelpCircle,
  Mail,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';

const navbarCategories = [
  'Electronics',
  'Fashion',
  'Shoes',
  'Watches',
  'Accessories'
];

export const Navbar: React.FC = () => {
  const { user, logout, cart, wishlist, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for sticky premium visual changes
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-slate-900/95 dark:bg-slate-950/95 shadow-xl shadow-slate-900/10 border-slate-800/80 backdrop-blur-md py-2' 
          : 'bg-slate-900/80 dark:bg-slate-950/80 border-slate-800 backdrop-blur-md py-4'
      } text-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 group-hover:bg-blue-500 p-2.5 rounded-2xl transition-colors shadow-lg shadow-blue-500/15"
            >
              <ShoppingBag className="h-5 w-5" />
            </motion.div>
            <span className="text-xl font-black tracking-tight">
              GenZ<span className="text-blue-500">mart</span>
            </span>
          </Link>

          {/* Search Bar - Desktop (Placed on the left next to logo) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs xl:max-w-sm relative">
            <button type="submit" className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none cursor-pointer flex items-center justify-center">
              <Search className="h-4 w-4" />
            </button>
            <input
              type="text"
              placeholder="Search drops, tech, hoodies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-blue-500 focus:bg-slate-800 transition-all placeholder:text-slate-400 text-slate-100"
            />
          </form>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold relative">
            
            {/* Home link */}
            <Link
              to="/"
              className={`relative py-1 transition-colors ${isActive('/') ? 'text-blue-500' : 'text-slate-300 hover:text-white'}`}
            >
              Home
              {isActive('/') && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-[-6px] left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* Shop Link */}
            <Link
              to="/shop"
              className={`relative py-1 transition-colors ${isActive('/shop') ? 'text-blue-500' : 'text-slate-300 hover:text-white'}`}
            >
              Shop
              {isActive('/shop') && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-[-6px] left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* Categories Dropdown Container */}
            <div ref={categoriesRef} className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1.5 py-1 text-slate-300 hover:text-white cursor-pointer focus:outline-none"
              >
                Categories
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${categoriesDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              <AnimatePresence>
                {categoriesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-200"
                  >
                    <div className="px-4 py-2 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-blue-500" /> Style Departments
                    </div>
                    {navbarCategories.map((catName) => (
                      <Link
                        key={catName}
                        to={`/shop?category=${encodeURIComponent(catName)}`}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400" />
                        {catName}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Link */}
            <Link
              to="/about"
              className={`relative py-1 transition-colors ${isActive('/about') ? 'text-blue-500' : 'text-slate-300 hover:text-white'}`}
            >
              About
              {isActive('/about') && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-[-6px] left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* Contact Link */}
            <Link
              to="/contact"
              className={`relative py-1 transition-colors ${isActive('/contact') ? 'text-blue-500' : 'text-slate-300 hover:text-white'}`}
            >
              Contact
              {isActive('/contact') && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-[-6px] left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

          </div>

          {/* Right Controls - Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-colors cursor-pointer focus:outline-none border border-transparent hover:border-slate-800"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-300" />}
            </motion.button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-colors relative border border-transparent hover:border-slate-800"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-[10px] font-black text-white h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-2xl transition-colors relative border border-transparent hover:border-slate-800"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-blue-500 text-[10px] font-black text-white h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 hover:bg-slate-800 rounded-full border border-slate-800 focus:outline-none transition-colors"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black uppercase shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs max-w-[80px] truncate pr-1 font-bold text-slate-200">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-slate-200"
                    >
                      <div className="px-4 py-2 border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Identity Profile <p className="font-semibold text-slate-200 truncate normal-case text-xs mt-0.5">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-blue-400" />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800 hover:text-white transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-left hover:bg-slate-800 hover:text-rose-400 transition-colors border-t border-slate-800"
                      >
                        <LogOut className="h-4 w-4 text-rose-500" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Action Controls */}
          <div className="flex items-center gap-2 md:hidden flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-300" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu with animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-800 bg-slate-900 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative mt-2">
                <button type="submit" className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 hover:text-blue-400 transition-colors focus:outline-none cursor-pointer flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  placeholder="Search drops, tech, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-slate-800 focus:outline-none text-white"
                />
              </form>

              {/* Navigation Items */}
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive('/') ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                >
                  <Compass className="h-4 w-4" /> Home Page
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive('/shop') ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                >
                  <Compass className="h-4 w-4" /> Shop Catalog
                </Link>

                {/* Mobile Categories collapsible links */}
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 pt-3">
                  Curation Hubs
                </div>
                {navbarCategories.map((catName) => (
                  <Link
                    key={catName}
                    to={`/shop?category=${encodeURIComponent(catName)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-6 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    • {catName}
                  </Link>
                ))}

                <div className="border-t border-slate-800/60 my-2" />

                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive('/about') ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                >
                  <Info className="h-4 w-4" /> About Us
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive('/contact') ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                >
                  <Mail className="h-4 w-4" /> Contact
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive('/wishlist') ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                >
                  <span className="flex items-center gap-3">
                    <Heart className="h-4 w-4" /> Wishlist
                  </span>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-500 text-[10px] font-black px-2 py-0.5 rounded-full text-white">{wishlistCount}</span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${isActive('/cart') ? 'bg-slate-850 text-blue-400' : 'text-slate-300'}`}
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4" /> Shopping Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-blue-500 text-[10px] font-black px-2 py-0.5 rounded-full text-white">{cartCount}</span>
                  )}
                </Link>
              </div>

              {/* User Section Mobile */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-1">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover border border-slate-700" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs uppercase text-white shadow-md">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{user.email}</div>
                      </div>
                    </div>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-850 text-blue-400"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-850 text-slate-200"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-850 text-rose-400 text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-blue-600 text-white text-center py-3 rounded-2xl text-xs font-black uppercase tracking-widest block"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
