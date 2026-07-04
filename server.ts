import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { seedDatabase } from './backend/config/db';

// Import Routes
import authRoutes from './backend/routes/authRoutes';
import productRoutes from './backend/routes/productRoutes';
import categoryRoutes from './backend/routes/categoryRoutes';
import orderRoutes from './backend/routes/orderRoutes';
import cartRoutes from './backend/routes/cartRoutes';
import wishlistRoutes from './backend/routes/wishlistRoutes';
import couponRoutes from './backend/routes/couponRoutes';
import chatbotRoutes from './backend/routes/chatbotRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Auto-seed our premium e-commerce database with initial collections on startup
  try {
    seedDatabase();
  } catch (err) {
    console.error('Database seeding failed:', err);
  }

  // Robust built-in parser for JSON bodies (supports larger size for profile images)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Custom CORS middleware to avoid cross-origin blockages during dev or sharing
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Mount API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/chatbot', chatbotRoutes);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  // Vite Integration for Assets and Frontend routing
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting server in DEVELOPMENT mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Starting server in PRODUCTION mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🚀 GenZmart Full Stack App running on port ${PORT}`);
    console.log(`🔗 Dev Link: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full stack Express server:', err);
});
