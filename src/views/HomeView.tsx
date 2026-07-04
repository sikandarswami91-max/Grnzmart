import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api, useApp } from '../context/AppContext';
import { IProduct, ICategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton, CategorySkeleton } from '../components/Skeleton';
import { 
  ArrowRight, 
  Compass, 
  Sparkles, 
  Flame, 
  Zap, 
  CheckCircle, 
  Truck, 
  ShieldCheck, 
  Award, 
  Headset, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  ArrowUpRight 
} from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Sikandar Swami",
    role: "Sneakerhead & Collector",
    text: "GenZmart drops are absolute fire. The authentic verification process is bulletproof, and my shoes arrived in pristine packaging. Instant support 24/7!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Chloe Chen",
    role: "Streetwear Stylist",
    text: "The selection represents real premium street culture. From high-end apparel to technical gadgets, the visual pairing is exquisite. Highly recommend GenZmart!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Liam O'Connor",
    role: "Tech Enthusiast",
    text: "I was looking for verified accessories and watches. The ordering was smooth, fast delivery to my door, and the customer experience team is incredibly responsive.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop"
  }
];

const fallbackCategories = [
  { id: 'cat-1', name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop' },
  { id: 'cat-2', name: 'Fashion', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop' },
  { id: 'cat-3', name: 'Shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop' },
  { id: 'cat-4', name: 'Watches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop' },
  { id: 'cat-5', name: 'Accessories', image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?w=500&auto=format&fit=crop' }
];

export const HomeView: React.FC = () => {
  const { showToast } = useApp();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [featured, setFeatured] = useState<IProduct[]>([]);
  const [bestSellers, setBestSellers] = useState<IProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Testimonials Slider State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Fetch Home Data
  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [catRes, featRes, bestRes, newRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?isFeatured=true'),
        api.get('/products?isBestSeller=true'),
        api.get('/products?isNewArrival=true')
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }
      if (featRes.data.success) {
        setFeatured(featRes.data.products);
      }
      if (bestRes.data.success) {
        setBestSellers(bestRes.data.products);
      }
      if (newRes.data.success) {
        setNewArrivals(newRes.data.products);
      }
    } catch (err) {
      console.error('Failed to load homepage resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNewsletterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast('Welcome to the inner circle! Check your email for a 20% discount.', 'success');
      setNewsletterEmail('');
    }
  };

  // Categories list with fallbacks if DB returned list is empty
  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen overflow-hidden">
      
      {/* 1. HERO SECTION WITH GRADIENT BACKGROUND AND ENHANCED ANIMATIONS */}
      <section className="relative min-h-[90vh] flex items-center bg-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Animated ambient backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[130px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />
          <img
            src="https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1600&auto=format&fit=crop&q=80"
            alt="Hero Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-10 filter mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              UPGRADE YOUR STREET AESTHETIC
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight font-display text-white"
            >
              Unleash the <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-400">
                Next-Gen Drip
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Exquisite limited-run streetwear catalogs fused with sustainable engineering and authenticated tech devices. Made for those who set the trends, not follow them.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Link
                to="/shop"
                className="group relative bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 hover:-translate-y-1"
              >
                Shop Limited Drops
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="bg-slate-900/60 hover:bg-slate-800/80 text-white border border-slate-800 font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:border-slate-700 hover:-translate-y-1"
              >
                Explore Story
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Right Media (Animated image card) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-5 relative justify-self-center lg:justify-self-end w-full max-w-md"
          >
            {/* Soft glow circle behind */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[2.5rem] blur opacity-25 animate-pulse pointer-events-none" />
            
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative bg-slate-900 border border-slate-800/80 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/0 rounded-full blur-2xl pointer-events-none" />
              
              {/* Product Image Stage */}
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3] bg-slate-950/50 mb-6">
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
                  alt="Air Max Fury"
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full scale-105 group-hover:scale-115 group-hover:rotate-1 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                <span className="absolute top-4 left-4 bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-bounce">
                  GRAIL DROP
                </span>
              </div>

              {/* Card Meta */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Grail Footwear</span>
                  <h3 className="text-xl font-black text-white mt-1 group-hover:text-blue-400 transition-colors">Air Max Fury "Neon"</h3>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-2xl flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-white">4.9</span>
                </div>
              </div>

              {/* Action and Pricing */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-800/80">
                <div>
                  <span className="text-2xl font-black text-white">$189.00</span>
                  <span className="text-xs text-slate-500 line-through pl-2">$249.00</span>
                </div>
                <Link
                  to="/product/prod-1"
                  className="bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center gap-1.5"
                >
                  Acquire Drip
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. FEATURED CATEGORIES SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end text-center sm:text-left gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-500 uppercase tracking-widest justify-center sm:justify-start mb-1">
              <Compass className="h-4 w-4 animate-spin-slow" /> STYLES & CURATIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display">
              Explore Curation Hubs
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-black text-blue-500 hover:text-blue-600 flex items-center gap-1 group transition-all duration-300">
            View All Catalogs <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid (Enhanced visual cards with overlay) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {displayCategories.slice(0, 5).map((cat, idx) => (
            <Link
              key={cat.id || idx}
              to={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/40 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Image backdrop */}
              <img
                src={cat.image}
                alt={cat.name}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Dynamic Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-75 group-hover:opacity-85 transition-opacity duration-300" />
              
              {/* Visual floating accent tag */}
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-wider scale-0 group-hover:scale-100 transition-transform duration-300">
                Shop Drop
              </div>

              {/* Title label */}
              <div className="absolute bottom-5 left-5 right-5 text-left space-y-1">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Category</p>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider line-clamp-1">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* 3. FEATURED PRODUCTS DROPS */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end text-center sm:text-left gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-500 uppercase tracking-widest justify-center sm:justify-start mb-1">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" /> ACCREDITED PRODUCTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display">
              Grail Drops of the Week
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
          ) : featured.length > 0 ? (
            featured.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              No featured drops available right now. Check back shortly!
            </div>
          )}
        </div>
      </motion.section>

      {/* 4. WHY CHOOSE US - SEAMLESS TRUST SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInVariants}
        className="bg-slate-100 dark:bg-slate-950/50 border-y border-slate-200/50 dark:border-slate-800/40 py-16 sm:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">
              OUR SERVICE COMMITMENTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              Unrivaled Commerce Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Every package represents our absolute promise of style, authenticity, and continuous support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Fast Delivery</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Free shipping on orders over $150. Handed over to courier within 24 hours. Track every step.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="p-3.5 bg-green-500/10 text-green-500 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Secure Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Integrated with premium financial gateways like Stripe and Razorpay. Safe transactions.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Best Quality</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Thorough physical authentication testing at our warehouse hubs. Authenticity guaranteed.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm hover:shadow-xl transition-all duration-300 text-center space-y-4 group">
              <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform">
                <Headset className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">24/7 Support</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dedicated customer team waiting to help you with exchanges, size inquiries, and delivery questions.
              </p>
            </div>

          </div>

        </div>
      </motion.section>

      {/* 5. INTERACTIVE TESTIMONIAL SLIDER */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInVariants}
        className="max-w-4xl mx-auto px-4 text-center space-y-8 relative"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">
            CUSTOMER PRAISE
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
            Vouched by the Community
          </h2>
        </div>

        {/* Testimonial slider stage */}
        <div className="relative bg-white dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 p-8 sm:p-12 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[250px] flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTestimonial}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Star Rating */}
              <div className="flex justify-center gap-1">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-200 leading-relaxed font-medium italic">
                "{testimonials[activeTestimonial].text}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-3">
                <img
                  src={testimonials[activeTestimonial].avatar}
                  alt={testimonials[activeTestimonial].name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border-2 border-blue-500/25"
                />
                <div className="text-left">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-[10px] text-slate-400">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/35">
            <button
              onClick={handlePrevTestimonial}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors focus:outline-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Dots */}
            <div className="flex gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}
                />
              ))}
            </div>

            <button
              onClick={handleNextTestimonial}
              className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors focus:outline-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </motion.section>

      {/* 6. MODERN NEWSLETTER SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInVariants}
        className="max-w-5xl mx-auto px-4 sm:px-6"
      >
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 md:p-16 text-white text-center space-y-6 shadow-2xl overflow-hidden">
          
          {/* Accent lighting details */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest block">
              JOIN THE GENZMART INSIDERS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-display">
              Get Notified of the Next Drop
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
              We never spam. Sign up to receive exclusive invites, early coupon releases, and private catalog entries.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl sm:rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Mail className="h-4.5 w-4.5 text-blue-200" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-blue-200 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                className="bg-white hover:bg-slate-50 text-blue-600 font-black text-xs px-6 py-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                Join Now <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

        </div>
      </motion.section>

      {/* 7. RECENT NEW ARRIVALS DROPS */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end text-center sm:text-left gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-blue-500 uppercase tracking-widest justify-center sm:justify-start mb-1">
              <Zap className="h-4 w-4 text-blue-500 animate-pulse" /> JUST LAUNCHED
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-display">
              Fresh Street Curations
            </h2>
          </div>
          <Link to="/shop?sort=latest" className="text-xs font-black text-blue-500 hover:text-blue-600 flex items-center gap-1 group transition-all duration-300">
            See New Arrivals <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
          ) : newArrivals.length > 0 ? (
            newArrivals.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
              No new arrivals right now. Check back soon for the next drop!
            </div>
          )}
        </div>
      </motion.section>

    </div>
  );
};
