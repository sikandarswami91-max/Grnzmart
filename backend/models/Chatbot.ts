import fs from 'fs';
import path from 'path';
import { readCollection, writeCollection, getFilePath } from '../config/db';

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IChatbotSettings {
  isEnabled: boolean;
  welcomeMessage: string;
  predefinedFAQs: IFAQ[];
  aiModel: string;
  temperature: number;
  systemPrompt: string;
}

export interface IChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface IChatSession {
  sessionId: string;
  userEmail: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'chatbot_settings.json');
const HISTORY_FILE = path.join(process.cwd(), 'data', 'chatbot_history.json');

export const ChatbotModel = {
  getSettings(): IChatbotSettings {
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading chatbot settings:', err);
    }
    // Return defaults if read fails
    return {
      isEnabled: true,
      welcomeMessage: "👋 Welcome to Gen Zmart!\n\nHow can I help you today?\n\nYou can ask me about:\n• Products\n• Orders\n• Shipping\n• Payment\n• Returns\n• Offers\n• Contact Support",
      predefinedFAQs: [],
      aiModel: "gemini-3.5-flash",
      temperature: 0.7,
      systemPrompt: "You are GenZmart AI Assistant. Help the user with product searches, orders, and inquiries."
    };
  },

  updateSettings(settings: Partial<IChatbotSettings>): IChatbotSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing chatbot settings:', err);
    }
    return updated;
  },

  getSessions(): IChatSession[] {
    try {
      if (fs.existsSync(HISTORY_FILE)) {
        const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading chatbot history:', err);
    }
    return [];
  },

  saveMessage(sessionId: string, userEmail: string, sender: 'user' | 'bot', text: string): IChatSession {
    const sessions = this.getSessions();
    let session = sessions.find(s => s.sessionId === sessionId);
    const now = new Date().toISOString();

    const newMessage: IChatMessage = {
      sender,
      text,
      timestamp: now
    };

    if (session) {
      session.messages.push(newMessage);
      session.updatedAt = now;
      if (userEmail && userEmail !== 'Anonymous' && session.userEmail === 'Anonymous') {
        session.userEmail = userEmail;
      }
    } else {
      session = {
        sessionId,
        userEmail: userEmail || 'Anonymous',
        messages: [newMessage],
        createdAt: now,
        updatedAt: now
      };
      sessions.push(session);
    }

    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing chatbot history:', err);
    }

    return session;
  },

  clearHistory(): void {
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  },

  getMostAskedQuestions(): { question: string; count: number }[] {
    const sessions = this.getSessions();
    const questions: { [key: string]: number } = {};

    sessions.forEach(session => {
      session.messages.forEach(msg => {
        if (msg.sender === 'user') {
          const text = msg.text.trim().toLowerCase();
          // Group simple inquiries
          let category = 'General Inquiry';
          if (text.includes('return') || text.includes('refund')) {
            category = 'Return & Refund Policy';
          } else if (text.includes('order') || text.includes('track') || text.includes('ord-')) {
            category = 'Order Tracking';
          } else if (text.includes('coupon') || text.includes('discount') || text.includes('promo')) {
            category = 'Discount Coupons & Offers';
          } else if (text.includes('shipping') || text.includes('delivery') || text.includes('delivery time')) {
            category = 'Shipping & Delivery';
          } else if (text.includes('payment') || text.includes('stripe') || text.includes('razorpay')) {
            category = 'Payment Methods';
          } else if (text.includes('shoe') || text.includes('laptop') || text.includes('hoodie') || text.includes('watch') || text.includes('product')) {
            category = 'Product Information';
          } else if (text.includes('contact') || text.includes('support') || text.includes('email') || text.includes('phone')) {
            category = 'Customer Support Contact';
          }

          questions[category] = (questions[category] || 0) + 1;
        }
      });
    });

    return Object.entries(questions)
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count);
  }
};
