import React, { useState, useEffect, useRef } from 'react';
import { useApp, api } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle, X, Send, Bot, User, Mic, MicOff, Smile, Paperclip,
  Volume2, VolumeX, Headphones, Phone, Mail, Globe, Loader2, RotateCcw,
  Gift, Search, ShoppingCart, ArrowRight, CheckCheck, Trash2, ExternalLink
} from 'lucide-react';

interface IChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  image?: string; // base64 representation of attached image
  products?: any[];
  order?: any;
  isLiveAgent?: boolean;
}

export const Chatbot: React.FC = () => {
  const { user, token, addToCart, showToast } = useApp();
  const navigate = useNavigate();

  // Chat Window State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Extra Features State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isEmojiOpen, setIsEmojiOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLiveAgentMode, setIsLiveAgentMode] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string } | null>(null);

  // Settings loaded from admin
  const [chatbotSettings, setChatbotSettings] = useState<any>(null);

  // DOM references for auto-scroll and file select
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history and settings from local storage and backend
  useEffect(() => {
    // Generate or restore Session ID
    let savedSessId = localStorage.getItem('chatbot_session_id');
    if (!savedSessId) {
      savedSessId = `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem('chatbot_session_id', savedSessId);
    }
    setSessionId(savedSessId);

    // Load Chat settings
    api.get('/chatbot/settings')
      .then(res => {
        if (res.data.success) {
          setChatbotSettings(res.data.settings);
        }
      })
      .catch(err => console.error('Failed to load chatbot settings:', err));

    // Restore message history from LocalStorage
    const savedMessages = localStorage.getItem('chatbot_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (err) {
        console.error('Failed to parse saved chatbot messages:', err);
      }
    }
  }, []);

  // Update welcome message if messages are empty and settings are loaded
  useEffect(() => {
    if (messages.length === 0 && chatbotSettings) {
      const welcomeText = language === 'en' 
        ? chatbotSettings.welcomeMessage 
        : `👋 जेन ज़मार्ट में आपका स्वागत है!\n\nमैं आज आपकी क्या सहायता कर सकता हूँ?\n\nआप मुझसे इनके बारे में पूछ सकते हैं:\n• उत्पाद (Products)\n• ऑर्डर (Orders)\n• शिपिंग (Shipping)\n• भुगतान (Payment)\n• रिटर्न (Returns)\n• ऑफर (Offers)\n• कस्टमर सपोर्ट से संपर्क करें (Support)`;

      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: welcomeText,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [chatbotSettings, messages.length, language]);

  // Save messages to LocalStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Handle unread counts when window is closed
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages or typing status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Play support sound helper
  const playNotificationSound = () => {
    if (isMuted) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioContext.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioContext.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);

      osc.start();
      osc.stop(audioContext.currentTime + 0.35);
    } catch (err) {
      // Audio context might be blocked or unsupported
    }
  };

  // Text to speech synthesizer
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel current speaking
      window.speechSynthesis.cancel();
      
      // Strip markdown syntax
      const cleanText = text.replace(/[*#`•_-]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      showToast('Text-to-speech not supported on this browser', 'info');
    }
  };

  // Voice Input Speech Recognition Setup
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Recognition is not supported in this browser', 'error');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      showToast('Listening...', 'info');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputValue((prev) => prev + (prev ? ' ' : '') + text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Drag and drop attachment helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Only image files are supported', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        // Strip data prefix for Gemini payload
        const base64Clean = base64.split(',')[1];
        setAttachedImage({
          data: base64Clean,
          mimeType: file.type
        });
        showToast('Image attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text && !attachedImage) return;

    // Create unique message
    const userMessage: IChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text || 'Sent an image attachment',
      timestamp: new Date().toISOString(),
      image: attachedImage ? `data:${attachedImage.mimeType};base64,${attachedImage.data}` : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsEmojiOpen(false);

    // Prepare image payload
    const imagePayload = attachedImage ? { ...attachedImage } : null;
    setAttachedImage(null);

    // If live agent mode is enabled, route to agent simulation
    if (isLiveAgentMode) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const botReplyText = language === 'hi'
          ? "नमस्ते! मैं आपका लाइव एजेंट रोहन हूँ। मैंने आपका संदेश पढ़ लिया है। मैं इसे तुरंत चेक करके आपको अपडेट देता हूँ! 😊"
          : "Hey there! This is Rohan from Live Drop Support. I've received your query and I am checking this immediately for you! Give me just a quick moment. 🙌";

        const botReply: IChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botReplyText,
          timestamp: new Date().toISOString(),
          isLiveAgent: true
        };
        setMessages((prev) => [...prev, botReply]);
        playNotificationSound();
      }, 1500);
      return;
    }

    setIsLoading(true);

    try {
      // Map history format for server endpoint
      const historyPayload = messages.slice(-10).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response = await api.post('/chatbot/message', {
        message: text,
        sessionId,
        history: historyPayload,
        image: imagePayload
      });

      if (response.data.success) {
        const botReply: IChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: response.data.reply,
          timestamp: new Date().toISOString(),
          products: response.data.products,
          order: response.data.order
        };

        setMessages((prev) => [...prev, botReply]);
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
        }
        playNotificationSound();
      }
    } catch (err: any) {
      console.error('Chatbot endpoint error:', err);
      // Fallback message
      const errMsg: IChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: "My brain took a quick snooze! 😴 Please double check that my servers are running and try again, or trigger a Live Agent hand-off below.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Agent activation
  const handleToggleLiveAgent = () => {
    setIsLiveAgentMode(prev => {
      const newVal = !prev;
      if (newVal) {
        // Connect system message
        const systemMsg: IChatMessage = {
          id: `sys-${Date.now()}`,
          sender: 'bot',
          text: language === 'hi'
            ? "🔄 लाइव एजेंट कनेक्ट किया जा रहा है... आप अब रोहन (लाइव सपोर्ट प्रमुख) से जुड़े हैं। 🚀"
            : "🔄 Handing off to Live Agent... You are now connected with Rohan (Live Drop Support Expert). 🚀",
          timestamp: new Date().toISOString(),
          isLiveAgent: true
        };
        setMessages((prev) => [...prev, systemMsg]);
        showToast('Connected to Live Support', 'info');
      } else {
        showToast('Switched back to Gen Zmart AI', 'info');
      }
      return newVal;
    });
  };

  // Language Switch
  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
    showToast(language === 'en' ? 'भाषा बदलकर हिंदी कर दी गई है' : 'Language set to English', 'info');
  };

  // Reset conversation
  const resetConversation = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप बातचीत रीसेट करना चाहते हैं?' : 'Reset this conversation?')) {
      setMessages([]);
      localStorage.removeItem('chatbot_messages');
      setIsLiveAgentMode(false);
      showToast('Chat history cleared', 'info');
    }
  };

  // Emoji collection
  const EMOJIS = ['😊', '🔥', '💻', '👟', '📦', '💸', '⚡', '🤩', '💬', '💯'];

  // Welcome check
  if (chatbotSettings && !chatbotSettings.isEnabled) {
    return null; // Disabled by admin
  }

  return (
    <>
      {/* 1. FLOATING CHAT TRIGGER BUTTON */}
      <div className="fixed right-6 bottom-20 z-50">
        <button
          id="btn-chatbot-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.6)] hover:shadow-[0_0_30px_rgba(79,70,229,0.9)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer group flex items-center justify-center border border-white/10"
          title="Chat with GenZmart AI"
        >
          {isOpen ? (
            <X className="h-6 w-6 transform rotate-90 scale-95 transition-transform duration-300" />
          ) : (
            <MessageCircle className="h-6 w-6 transform rotate-0 scale-100 transition-transform duration-300 group-hover:rotate-12" />
          )}

          {/* Glow waves */}
          <span className="absolute inset-0 rounded-full bg-indigo-500/30 scale-105 animate-ping -z-10"></span>

          {/* Unread indicator */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. CHAT WINDOW STAGE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-window"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-4 bottom-36 z-50 w-[92vw] sm:w-[420px] h-[80vh] sm:h-[620px] max-h-[90vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden"
          >
            {/* GRADIENT HEADER */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white px-5 py-4 flex items-center justify-between shadow-md relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
                    {isLiveAgentMode ? (
                      <Headphones className="h-5 w-5 text-emerald-300 animate-pulse" />
                    ) : (
                      <Bot className="h-5 w-5 text-blue-200" />
                    )}
                  </div>
                  {/* Status dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 h-3.5 w-3.5 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <span className="bg-white h-1 w-1 rounded-full animate-ping"></span>
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase flex items-center gap-1.5">
                    {isLiveAgentMode ? 'Rohan (Support)' : 'GenZmart AI'}
                    {isLiveAgentMode && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-emerald-500/30">AGENT</span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                    Online & Active
                  </p>
                </div>
              </div>

              {/* HEADER BUTTONS */}
              <div className="flex items-center gap-1.5">
                {/* Clear Conversation */}
                <button
                  onClick={resetConversation}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="h-4.5 w-4.5 text-slate-100" />
                </button>

                {/* English / Hindi Toggle */}
                <button
                  onClick={toggleLanguage}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-0.5 cursor-pointer"
                  title="Toggle Language"
                >
                  <Globe className="h-4.5 w-4.5 text-slate-100" />
                  <span className="text-[9px] font-black uppercase">{language}</span>
                </button>

                {/* Mute toggle */}
                <button
                  onClick={() => {
                    setIsMuted(!isMuted);
                    showToast(isMuted ? 'Notification sounds enabled' : 'Sounds muted', 'info');
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                </button>

                {/* Close window */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* CHAT MESSAGES BODY */}
            <div className="flex-grow overflow-y-auto px-4 py-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
              {messages.map((msg, index) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id || index} className={`flex ${msg.isLiveAgent ? 'justify-center my-3' : isBot ? 'justify-start' : 'justify-end'} gap-2.5`}>
                    
                    {/* Live agent status divider banner */}
                    {msg.isLiveAgent && msg.id.startsWith('sys') ? (
                      <div className="bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 w-full max-w-[90%] shadow-sm">
                        {msg.text}
                      </div>
                    ) : (
                      <>
                        {/* Bot avatar */}
                        {isBot && !msg.isLiveAgent && (
                          <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                            <Bot className="h-4.5 w-4.5" />
                          </div>
                        )}

                        {/* Speech Bubble */}
                        <div className="max-w-[78%] flex flex-col gap-1.5">
                          <div
                            className={`p-3.5 rounded-2xl text-xs relative leading-relaxed ${
                              isBot
                                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-800'
                                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md'
                            }`}
                          >
                            {/* Render user image if attached */}
                            {msg.image && (
                              <img src={msg.image} alt="User attachment" referrerPolicy="no-referrer" className="rounded-xl max-h-40 object-cover mb-2 border border-white/10 shadow-sm" />
                            )}

                            {/* Text content with multi-line support */}
                            <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>

                            {/* Speech Synthesis Audio Button on bot bubble */}
                            {isBot && (
                              <button
                                onClick={() => speakText(msg.text)}
                                className="absolute right-1.5 bottom-1.5 opacity-0 hover:opacity-100 group-hover:opacity-100 focus:opacity-100 p-1 bg-slate-100 dark:bg-slate-700/60 rounded-lg hover:scale-105 transition-all text-slate-500 dark:text-slate-300"
                                style={{ transform: 'translateY(15%)', visibility: 'hidden' }} // Keep clean, hover triggers
                                title="Speak answer out loud"
                              >
                                <Volume2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          {/* DYNAMIC CARD RENDERING FOR SEARCH PRODUCTS */}
                          {msg.products && msg.products.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto py-1.5 max-w-full snap-x">
                              {msg.products.map((prod: any) => (
                                <div key={prod.id} className="min-w-[190px] w-[190px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3 shadow-md flex flex-col justify-between snap-start">
                                  <div className="relative">
                                    <img src={prod.images[0]} alt={prod.name} referrerPolicy="no-referrer" className="h-24 w-full object-cover rounded-xl bg-slate-50" />
                                    {prod.discount > 0 && (
                                      <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">
                                        -{prod.discount}%
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-2.5 space-y-1">
                                    <h4 className="font-extrabold text-[10px] text-slate-800 dark:text-white line-clamp-1">{prod.name}</h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-black text-blue-600 dark:text-blue-400">${prod.price}</p>
                                      {prod.originalPrice > prod.price && (
                                        <p className="text-[9px] text-slate-400 line-through">${prod.originalPrice}</p>
                                      )}
                                    </div>
                                    <p className={`text-[8px] font-black ${prod.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      ● {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </p>
                                  </div>

                                  <div className="mt-3 flex gap-1.5">
                                    <button
                                      onClick={() => navigate(`/product/${prod.id}`)}
                                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[8px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-0.5 transition-colors"
                                      title="View detail"
                                    >
                                      Detail <ArrowRight className="h-2.5 w-2.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        addToCart(prod.id, 1);
                                      }}
                                      disabled={prod.stock <= 0}
                                      className="py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center disabled:bg-slate-300 disabled:cursor-not-allowed"
                                      title="Add to cart"
                                    >
                                      <ShoppingCart className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* DYNAMIC CARD RENDERING FOR ORDER TRACKING */}
                          {msg.order && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 shadow-md mt-1.5 text-xs space-y-3.5">
                              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/40 pb-2">
                                <div>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tracking Code</p>
                                  <h4 className="font-extrabold text-blue-500">{msg.order.id}</h4>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                  msg.order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                }`}>
                                  {msg.order.status}
                                </span>
                              </div>

                              {/* Simple delivery progress timeline */}
                              <div className="grid grid-cols-3 gap-1.5 text-center relative pt-1">
                                <div className="space-y-1.5">
                                  <div className="h-1 bg-blue-500 rounded-full w-full"></div>
                                  <p className="text-[8px] font-black text-blue-500">Processing</p>
                                </div>
                                <div className="space-y-1.5">
                                  <div className={`h-1 rounded-full w-full ${msg.order.status === 'Shipped' || msg.order.status === 'Delivered' ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                  <p className={`text-[8px] font-black ${msg.order.status === 'Shipped' || msg.order.status === 'Delivered' ? 'text-blue-500' : 'text-slate-400'}`}>Shipped</p>
                                </div>
                                <div className="space-y-1.5">
                                  <div className={`h-1 rounded-full w-full ${msg.order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                  <p className={`text-[8px] font-black ${msg.order.status === 'Delivered' ? 'text-emerald-500' : 'text-slate-400'}`}>Delivered</p>
                                </div>
                              </div>

                              <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/40">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-400">Payment Status:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{msg.order.isPaid ? '✓ Paid' : 'Pending'}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-400">Total Bill:</span>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-100">${msg.order.totalPrice}</span>
                                </div>
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-400">Estimated Delivery:</span>
                                  <span className="font-bold text-blue-500">{msg.order.isDelivered ? 'Delivered' : '3-5 Business Days'}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Read Receipts & Timestamp */}
                          <div className={`flex items-center gap-1 text-[8px] text-slate-400 font-bold ${isBot ? 'justify-start ml-1' : 'justify-end mr-1'}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isBot && (
                              <CheckCheck className="h-3 w-3 text-blue-500 animate-pulse" />
                            )}
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                );
              })}

              {/* Bot Loading Dots */}
              {isLoading && (
                <div className="flex justify-start gap-2.5">
                  <div className="h-8.5 w-8.5 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Bot className="h-4.5 w-4.5" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl flex items-center gap-1.5 shadow-sm">
                    <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-2 w-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* SUGGESTED / QUICK REPLY PILLS */}
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/60 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-100 dark:border-slate-800/40">
              <button
                onClick={() => handleSendMessage(language === 'hi' ? 'ऑर्डर ट्रैक करें' : 'Track Order')}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>📦</span> {language === 'hi' ? 'ट्रैक ऑर्डर' : 'Track Order'}
              </button>
              <button
                onClick={() => handleSendMessage(language === 'hi' ? 'सक्रिय कूपन' : 'Active Coupons')}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🔥</span> {language === 'hi' ? 'कूपन कोड' : 'Active Coupons'}
              </button>
              <button
                onClick={() => handleSendMessage(language === 'hi' ? 'वापसी नीति' : 'Return Policy')}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>🔄</span> {language === 'hi' ? 'रिटर्न पॉलिसी' : 'Return Policy'}
              </button>
              <button
                onClick={() => handleSendMessage(language === 'hi' ? 'संपर्क सपोर्ट' : 'Contact Support')}
                className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>📧</span> {language === 'hi' ? 'सहायता' : 'Contact Support'}
              </button>
            </div>

            {/* EMOJI PICKER DIALOG */}
            <AnimatePresence>
              {isEmojiOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-xl z-50 flex gap-2"
                >
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setInputValue((prev) => prev + emoji);
                        setIsEmojiOpen(false);
                      }}
                      className="text-base hover:scale-125 transition-transform p-1 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* INPUT FORM FIELD */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 p-3.5 space-y-2">
              
              {/* Attached Image Preview */}
              {attachedImage && (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700 w-fit relative">
                  <img src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} alt="Attached" referrerPolicy="no-referrer" className="h-10 w-10 object-cover rounded-lg" />
                  <span className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]">Image attached</span>
                  <button
                    onClick={() => setAttachedImage(null)}
                    className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white rounded-full transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                {/* Emoji trigger */}
                <button
                  type="button"
                  onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                  title="Insert emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>

                {/* File input image upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                  title="Attach screenshot/photo"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />

                {/* Main typing input field */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isLiveAgentMode 
                      ? (language === 'hi' ? 'लाइव चैट में लिखें...' : 'Type to live agent...') 
                      : (language === 'hi' ? 'मुझसे कुछ भी पूछें...' : 'Ask Gen Zmart anything...')
                  }
                  className="flex-grow bg-transparent text-xs py-2 focus:outline-none text-slate-800 dark:text-slate-100"
                />

                {/* Speech to text microphone */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500/10 text-rose-500 animate-pulse' 
                      : 'text-slate-400 hover:text-indigo-500'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak voice input'}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() && !attachedImage}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* QUICK CHANNELS & LIVE AGENT TOGGLE */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-bold">
                <div className="flex gap-2.5">
                  <a
                    href="https://wa.me/15550192831"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-500 flex items-center gap-1"
                    title="WhatsApp us"
                  >
                    <Phone className="h-3 w-3 text-emerald-500" /> WhatsApp
                  </a>
                  <a
                    href="mailto:support@genzmart.com"
                    className="hover:text-blue-500 flex items-center gap-1"
                    title="Email support team"
                  >
                    <Mail className="h-3 w-3 text-blue-500" /> Email
                  </a>
                </div>

                {/* Live Agent handoff toggle button */}
                <button
                  onClick={handleToggleLiveAgent}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isLiveAgentMode 
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 font-black' 
                      : 'bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  <Headphones className="h-3.5 w-3.5" />
                  {isLiveAgentMode ? 'Disconnect' : 'Live Agent'}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
