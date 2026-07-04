import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ChatbotModel, IChatMessage } from '../models/Chatbot';
import { ProductModel } from '../models/Product';
import { OrderModel } from '../models/Order';
import { CouponModel } from '../models/Coupon';
import { CategoryModel } from '../models/Category';
import { GoogleGenAI, Type } from '@google/genai';

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export const chatbotController = {
  // Get settings and FAQs
  getSettings(req: AuthenticatedRequest, res: Response): void {
    try {
      const settings = ChatbotModel.getSettings();
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update settings (Admin only)
  updateSettings(req: AuthenticatedRequest, res: Response): void {
    try {
      const updated = ChatbotModel.updateSettings(req.body);
      res.json({ success: true, settings: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get chat history (Admin only)
  getHistory(req: AuthenticatedRequest, res: Response): void {
    try {
      const sessions = ChatbotModel.getSessions();
      const mostAsked = ChatbotModel.getMostAskedQuestions();
      res.json({ success: true, sessions, mostAsked });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Clear chat history (Admin only)
  clearHistory(req: AuthenticatedRequest, res: Response): void {
    try {
      ChatbotModel.clearHistory();
      res.json({ success: true, message: 'Chat history cleared successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Handle messaging (supports both real AI and ultra-robust offline rule-based fallbacks)
  async handleMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { message, sessionId, history = [], image } = req.body;
    const settings = ChatbotModel.getSettings();

    if (!settings.isEnabled) {
      res.status(403).json({ success: false, message: 'Chatbot is currently disabled by administrator.' });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const sessionID = sessionId || `sess-${Date.now()}`;
    const userEmail = req.user ? req.user.email : 'Anonymous';
    const userName = req.user ? req.user.name : 'Guest';

    // Fetch all catalog context to feed to model or fallback rules
    const products = ProductModel.getAll();
    const categories = CategoryModel.getAll();
    const coupons = CouponModel.getAll();
    const orders = req.user ? OrderModel.find({ user: userEmail }) : [];

    // Save user message to history
    ChatbotModel.saveMessage(sessionID, userEmail, 'user', message);

    // 1. Try AI-powered route with Gemini
    const ai = getGeminiClient();
    if (ai) {
      try {
        const sysInstruction = `${settings.systemPrompt}
You are given the following real-time database context of GenZmart eCommerce platform:
- Catalog Products: ${JSON.stringify(
          products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            category: p.category,
            stock: p.stock,
            rating: p.rating,
          }))
        )}
- Product Categories: ${JSON.stringify(categories.map(c => c.name))}
- Discount Coupons: ${JSON.stringify(coupons.map(cp => ({ code: cp.code, value: cp.discountValue, type: cp.discountType })))}
- Current Authenticated User Email: ${userEmail}
- Current User Orders: ${JSON.stringify(
          orders.map(o => ({
            id: o.id,
            status: o.status,
            totalPrice: o.totalPrice,
            createdAt: o.createdAt,
            isPaid: o.isPaid,
            isDelivered: o.isDelivered,
          }))
        )}

Standard Shipping Policy: Standard shipping takes 3-5 business days and is $5. Free shipping is automatically applied on orders above $100.
Return Policy: 30-day free returns.
Refund Policy: Refund processed to original payment method in 5-7 business days.
Payment Methods: Credit/Debit Cards, Stripe, Razorpay, Cash on Delivery (COD).

Your response MUST be a single valid JSON object containing:
{
  "reply": "Your conversational answer in text (Gen-Z friendly but professional). Feel free to use markdown/bullet points for readability. Recommend similar products, cross-sell accessories, and offer matching coupons when relevant.",
  "productIdsToRender": ["Array of product IDs from the Catalog Products list if relevant to the search, recommendation, or discussion. Maximum 4. Leave empty if no specific products are mentioned."],
  "trackedOrderId": "The specific order ID (e.g. ord-XXXX) if the user is asking about order tracking, status, or entered an order ID. Leave empty if not tracking an order."
}

Do not include any thinking block, markdown enclosing, or extra text around the JSON. Your output must be purely valid JSON matching this schema.`;

        // Format history for Gemini chats
        const contents = history.map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }));

        // Append current message with optional multimodal image data
        const currentParts: any[] = [];
        if (image && image.data && image.mimeType) {
          currentParts.push({
            inlineData: {
              data: image.data,
              mimeType: image.mimeType
            }
          });
        }
        currentParts.push({ text: message });

        contents.push({
          role: 'user',
          parts: currentParts
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: contents,
          config: {
            systemInstruction: sysInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                productIdsToRender: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                trackedOrderId: { type: Type.STRING }
              },
              required: ['reply']
            }
          }
        });

        const jsonStr = response.text ? response.text.trim() : '';
        const data = JSON.parse(jsonStr);

        // Fetch actual rich product objects to send back
        const productIds = data.productIdsToRender || [];
        const matchedProducts = products.filter(p => productIds.includes(p.id));

        // Fetch actual order detail if requested
        let matchedOrder = null;
        if (data.trackedOrderId) {
          const ord = OrderModel.findById(data.trackedOrderId);
          if (ord) {
            matchedOrder = ord;
          }
        }

        // Save bot response to history
        ChatbotModel.saveMessage(sessionID, userEmail, 'bot', data.reply);

        res.json({
          success: true,
          sessionId: sessionID,
          reply: data.reply,
          products: matchedProducts,
          order: matchedOrder,
          aiPowered: true
        });
        return;
      } catch (err) {
        console.error('Gemini chatbot request failed, falling back to rule engine:', err);
      }
    }

    // 2. Fallback Rule-Based Smart Engine (Highly responsive even without Gemini key)
    const normalized = message.toLowerCase().trim();
    let reply = "";
    let matchedProducts: any[] = [];
    let matchedOrder: any = null;

    // Check pre-defined FAQ exact or partial matches
    const matchedFAQ = settings.predefinedFAQs.find(f => 
      normalized.includes(f.question.toLowerCase()) || 
      f.question.toLowerCase().includes(normalized)
    );

    if (matchedFAQ) {
      reply = matchedFAQ.answer;
    } 
    // Return & Refund policies
    else if (normalized.includes('return') || normalized.includes('refund') || normalized.includes('replace')) {
      reply = "Our return policy is super simple! You can return any product within 30 days of delivery for a 100% full refund. The items must be in their original packaging and unused. Once we receive your item, refunds are processed back to your original payment method within 5-7 business days.";
    }
    // Shipping questions
    else if (normalized.includes('shipping') || normalized.includes('delivery') || normalized.includes('how long')) {
      reply = "We offer standard and express shipping. Standard shipping takes 3-5 business days and costs a flat $5 (totally FREE for orders over $100!). Express shipping takes 1-2 business days. Tracking details will be emailed to you the moment your drop is shipped out.";
    }
    // Payment methods
    else if (normalized.includes('payment') || normalized.includes('pay') || normalized.includes('stripe') || normalized.includes('cod')) {
      reply = "We accept Credit/Debit cards, secure Stripe processing, Razorpay, and Cash on Delivery (COD) for your absolute convenience.";
    }
    // Coupon requests
    else if (normalized.includes('coupon') || normalized.includes('discount') || normalized.includes('code') || normalized.includes('offer')) {
      const couponCodes = coupons.map(c => `• **${c.code}** (${c.discountValue}${c.discountType === 'percentage' ? '%' : '$'} Off)`).join('\n');
      reply = `Score some sweet deals! Here are our active coupon codes you can apply at checkout right now:\n\n${couponCodes || '• **WELCOME10** (10% Off your first order!)'}\n\nJust enter the code in your cart to claim the savings!`;
    }
    // Contact details
    else if (normalized.includes('contact') || normalized.includes('support') || normalized.includes('help') || normalized.includes('email') || normalized.includes('phone') || normalized.includes('address')) {
      reply = "Need to chat with a human? We got you. You can reach out to our Customer Drop Support team via:\n\n📧 Email: **support@genzmart.com**\n📞 Phone: **+1 (555) 019-2831** (Mon-Fri 9AM - 6PM EST)\n📍 Headquarters: **133 Cyber Street, Floor 4, Neo-Vibe City**\n\nOr click the 'Email Support' or 'WhatsApp Support' buttons below for quick-connects!";
    }
    // Order tracking check
    else if (normalized.includes('order') || normalized.includes('track') || normalized.includes('ord-')) {
      // Look for a possible order ID in the text
      const orderIdMatch = message.match(/ord-[a-zA-Z0-9-]+/i);
      if (orderIdMatch) {
        const orderId = orderIdMatch[0];
        const foundOrder = OrderModel.findById(orderId);
        if (foundOrder) {
          // Check if this order belongs to logged-in user or if it's open search
          if (foundOrder.user === userEmail || userEmail === 'Anonymous' || req.user?.role === 'admin') {
            matchedOrder = foundOrder;
            reply = `Found your order **${foundOrder.id}**! It is currently **${foundOrder.status}**. It was placed on ${new Date(foundOrder.createdAt).toLocaleDateString()}. Payment status is ${foundOrder.isPaid ? 'Paid' : 'Pending'}.`;
          } else {
            reply = "I found that Order ID, but it seems to belong to a different account. Please log in with the correct account to view details.";
          }
        } else {
          reply = `I couldn't find any order with ID **${orderId}**. Please double-check your tracking ID and try again!`;
        }
      } else {
        // No order ID entered but user asked about order
        if (userEmail === 'Anonymous') {
          reply = "🔒 Please login to view your orders. If you have an Order ID (like `ord-123-456`), please paste it directly here and I'll track it for you instantly!";
        } else {
          if (orders.length > 0) {
            const list = orders.map(o => `• **${o.id}** - Status: **${o.status}** ($${o.totalPrice})`).join('\n');
            reply = `Here are your recent orders:\n\n${list}\n\nType the specific Order ID or paste it to track full delivery details!`;
          } else {
            reply = "You haven't placed any orders with us yet. Ready to start shopping?";
          }
        }
      }
    }
    // Product Search keyword matches
    else {
      // Find matching products by name/description/category
      const queryWords = normalized.split(/\s+/);
      const searchMatches = products.filter(p => {
        return queryWords.some(word => 
          p.name.toLowerCase().includes(word) || 
          p.description.toLowerCase().includes(word) || 
          p.category.toLowerCase().includes(word)
        );
      });

      if (searchMatches.length > 0) {
        matchedProducts = searchMatches.slice(0, 3);
        reply = `Awesome selection! I found ${searchMatches.length} product(s) matching your search in our catalog. Check them out below!`;
      } else {
        // Generic fallback greeting
        reply = `Hey ${userName}! I'm the GenZmart assistant. I can help you search our premium drops (like hoodies, sneakers, sunglasses, smartwatches), track your order, apply discount codes, or answer policies. What are you looking to do today?`;
      }
    }

    // Save bot response to history
    ChatbotModel.saveMessage(sessionID, userEmail, 'bot', reply);

    res.json({
      success: true,
      sessionId: sessionID,
      reply,
      products: matchedProducts,
      order: matchedOrder,
      aiPowered: false
    });
  }
};
