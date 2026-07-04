import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';

export const ContactView: React.FC = () => {
  const { showToast } = useApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      showToast('Message sent! Our streetwear support team will reply within 2 hours.', 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Title Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Hit Us Up</h1>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Got a sizing question, need to request an exchange, or want to pitch a custom brand drop? Fill out the secure form below. We're online 24/7.
          </p>
        </div>

        {/* Content columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact coordinates - 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm space-y-6">
              <h3 className="font-bold text-base">GenZmart Headquarters</h3>
              
              <div className="space-y-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Email Support</span>
                    <span className="text-slate-900 dark:text-white font-bold">sikandarswami91@gmail.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Phone Support</span>
                    <span className="text-slate-900 dark:text-white font-bold">9198431459</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Distribution Hub</span>
                    <span className="text-slate-900 dark:text-white font-bold">India</span>
                  </div>
                </div>
              </div>

              {/* Service Level commitments */}
              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6 flex items-start gap-3 bg-blue-500/5 p-4 rounded-2xl">
                <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-500">
                  <span className="font-bold block mb-1">Drip SLA Commitment:</span>
                  All support emails and product queries are resolved by real human operators in under 2 hours. Free worldwide returns/swaps are processed instantly.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form - 7 columns */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <h3 className="font-bold text-base mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/60">Send Direct Message</h3>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kai Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kai@dripmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  placeholder="Need size exchange for Neon sneakers..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Hey GenZmart, loved the hoodie! Just wanted to know if you'll restock the caps anytime soon..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900/60 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-blue-500/10"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
