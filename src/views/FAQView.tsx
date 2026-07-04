import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQView: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Are your streetwear drops genuine?",
      answer: "Absolutely. 100% authenticity is our core brand value. Every single sneaker drop, designer hoodie, or tech accessory listed on GenZmart is thoroughly inspected and verified by specialists at our distribution hubs before shipment. Replicas are strictly prohibited."
    },
    {
      question: "How long does shipping take?",
      answer: "We offer express domestic shipping. Most orders are packed and shipped within 24 hours. Transit typically takes 2 to 3 business days. You will receive a tracking link in your profile/invoice as soon as the item leaves our distribution center."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a flexible 30-day return or exchange window. If an item doesn't fit, or the visual doesn't match your aesthetic, you can open a refund or swap request directly in your account dashboard. The returned item must be unworn and in original packaging."
    },
    {
      question: "How do promotional coupon codes work?",
      answer: "You can enter discount codes directly in your Shopping Bag page under the 'Apply Promo Code' input. Valid codes (e.g., WELCOME10, SUMMER30) will instantly deduct the percentage or fixed cash value from your items subtotal before calculating shipping and tax."
    },
    {
      question: "What payment methods are supported?",
      answer: "GenZmart integrates Stripe, Razorpay, and Cash on Delivery. Stripe securely handles Visa, Mastercard, and Apple Pay. Razorpay facilitates UPI and digital wallet payments. Cash on Delivery allows you to make physical cash payments when the package arrives."
    }
  ];

  const toggleFAQ = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full w-fit mx-auto">
            <HelpCircle className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">FAQ</h1>
          <p className="text-xs text-slate-400">Got questions about drops, shipping, or returns? We've got answers.</p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex justify-between items-center p-5 font-bold text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors focus:outline-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-blue-500" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800/20 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
