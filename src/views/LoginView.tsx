import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Key, Mail, User, Eye, EyeOff } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register, token, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  
  // Field values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Visual options
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to catalog or profile
  useEffect(() => {
    if (token) {
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    }
  }, [token, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegisterMode) {
        if (!name) {
          showToast('Please enter your name', 'error');
          setSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          showToast('Passwords do not match', 'error');
          setSubmitting(false);
          return;
        }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Errors handled by Context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen py-16 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-xl relative z-10 space-y-6 backdrop-blur-md">
        
        {/* Branding Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl text-white shadow-md shadow-blue-500/10">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black">
            {isRegisterMode ? 'Join GenZmart' : 'Sign In to GenZmart'}
          </h1>
          <p className="text-xs text-slate-400">
            {isRegisterMode ? 'Unlock exclusive streetwear drops' : 'Manage your orders, wishlist, and bag'}
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Kai Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="kai@genzmart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs pl-10 pr-10 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
              />
              <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isRegisterMode && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none focus:bg-white text-slate-800 dark:text-white"
                />
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-xs shadow-lg shadow-blue-500/10 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            {submitting 
              ? (isRegisterMode ? 'Creating Account...' : 'Signing In...')
              : (isRegisterMode ? 'Create Account' : 'Sign In')
            }
          </button>
        </form>

        {/* Toggle Mode button */}
        <div className="text-center border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
          <p className="text-slate-400 font-medium">
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setName('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-blue-500 font-bold hover:underline focus:outline-none ml-1"
            >
              {isRegisterMode ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
