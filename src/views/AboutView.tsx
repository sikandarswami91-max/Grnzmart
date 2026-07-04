import React from 'react';
import { Shield, Sparkles, Truck, Users } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      
      {/* Hero Header */}
      <section className="bg-slate-950 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&auto=format&fit=crop"
            alt="About GenZmart"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-10 filter blur-[1px]"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Our Brand, Our Aesthetic
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Pioneering a visual pairing where high-performance textiles and sustainable streetwear genetics meet cutting-edge digital lifestyle.
          </p>
        </div>
      </section>

      {/* Main Copy */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black">Streetwear Reimagined</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              GenZmart was founded in 2026 out of a desire to build a premium e-commerce catalog that strictly honors Gen-Z culture, streetwear drops, and technical gadgets. We grew tired of plain templates and mass-market fast-fashion websites.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Our small development team focuses purely on custom designs, high-quality material stitching, and sustainable carbon offsets. Every drop is serialized, limited-run, and authenticated.
            </p>
          </div>
          <div className="relative rounded-3xl overflow-hidden aspect-video md:aspect-square shadow-xl border border-slate-200 dark:border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop"
              alt="Designer workshop"
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Brand pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-center space-y-3 shadow-sm">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mx-auto">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm">Hyper-Curated Drops</h3>
            <p className="text-xs text-slate-400 leading-relaxed">We don't do mass listings. Only items selected by street scouts and tech nerds.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-center space-y-3 shadow-sm">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mx-auto">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm">Verified Authenticity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">No fakes, no replicas. Every shoe and hoodie is authenticated at our distribution hub.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-center space-y-3 shadow-sm">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mx-auto">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm">Express Logistics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Integrated custom supply lines. Safe shipping and effortless size-swaps.</p>
          </div>

          <div className="bg-white dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/40 text-center space-y-3 shadow-sm">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl w-fit mx-auto">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-sm">Community Led</h3>
            <p className="text-xs text-slate-400 leading-relaxed">We support local indie designers and tech makers by allocating 15% shelf space to creators.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
