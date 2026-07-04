import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';
import { Chatbot } from './components/Chatbot';

// Views
import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { ProfileView } from './views/ProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { FAQView } from './views/FAQView';
import { LoginView } from './views/LoginView';
import { NotFoundView } from './views/NotFoundView';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-250 font-sans">
          {/* Header Navigation */}
          <Navbar />

          {/* Main Routing Stage */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/shop" element={<ShopView />} />
              <Route path="/product/:id" element={<ProductDetailView />} />
              <Route path="/cart" element={<CartView />} />
              <Route path="/checkout" element={<CheckoutView />} />
              <Route path="/order-success/:id" element={<OrderSuccessView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/admin" element={<AdminDashboardView />} />
              <Route path="/about" element={<AboutView />} />
              <Route path="/contact" element={<ContactView />} />
              <Route path="/faq" element={<FAQView />} />
              <Route path="/login" element={<LoginView />} />
              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </main>

          {/* Customer Support Footer */}
          <Footer />

          {/* Floating Action Notifications */}
          <ToastContainer />
          
          {/* AI-Powered Support Chatbot */}
          <Chatbot />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
