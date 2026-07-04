import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getFilePath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

export function readCollection<T>(collection: string): T[] {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    // If it doesn't exist, return empty or seed
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err);
    return [];
  }
}

export function writeCollection<T>(collection: string, data: T[]): void {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing collection ${collection}:`, err);
  }
}

// Global seeding function to populate the database with premium mock data if empty
export function seedDatabase(): void {
  // 1. Seed Categories
  const categoriesFile = getFilePath('categories');
  if (!fs.existsSync(categoriesFile) || readCollection('categories').length === 0) {
    const defaultCategories = [
      { id: 'cat-1', name: 'Footwear', slug: 'footwear', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop' },
      { id: 'cat-2', name: 'Apparel', slug: 'apparel', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop' },
      { id: 'cat-3', name: 'Tech Gadgets', slug: 'tech-gadgets', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop' },
      { id: 'cat-4', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop' }
    ];
    writeCollection('categories', defaultCategories);
    console.log('Seeded Categories successfully!');
  }

  // 2. Seed Products
  const productsFile = getFilePath('products');
  if (!fs.existsSync(productsFile) || readCollection('products').length === 0) {
    const defaultProducts = [
      {
        id: 'prod-1',
        name: 'Air Max Fury "Neon"',
        description: 'Take your street style to the stratosphere. The Air Max Fury features futuristic neon accents, dual-density foam midsoles, and transparent mesh styling. Perfect for urban explorers demanding premium comfort and unmatched aesthetics.',
        price: 189,
        originalPrice: 249,
        discount: 24,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop'
        ],
        category: 'Footwear',
        stock: 15,
        rating: 4.8,
        numReviews: 12,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: false,
        reviews: [
          { id: 'rev-1', user: 'sikandargoutam98@gmail.com', userName: 'Gautam Sikandar', rating: 5, comment: 'Hands down the comfiest sneakers I have ever owned! The neon looks incredibly vibrant in person.', createdAt: new Date().toISOString() },
          { id: 'rev-2', user: 'alice@example.com', userName: 'Alice Smith', rating: 4, comment: 'Very stylish, although they fit slightly snug. Recommend half size up.', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-2',
        name: 'GenZ Oversized Cyber Hoodie',
        description: 'Elevate your off-duty looks with our heavyweight, ultra-soft fleece cyber hoodie. Boxy oversized fit with minimal cybernetic print on the sleeves, premium metal aglets, and dropped shoulders.',
        price: 79,
        originalPrice: 119,
        discount: 33,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop'
        ],
        category: 'Apparel',
        stock: 22,
        rating: 4.6,
        numReviews: 8,
        isFeatured: true,
        isBestSeller: false,
        isNewArrival: true,
        reviews: [
          { id: 'rev-3', user: 'bob@example.com', userName: 'Bob Carter', rating: 5, comment: 'Extremely cozy and has that perfect heavy drape. Will buy the other colors too!', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-3',
        name: 'Chrono Smartwatch X-1',
        description: 'A masterpiece of wearable technology. The X-1 features an immersive always-on AMOLED display, futuristic customizable watchfaces, biometric wellness scanning, and a aerospace-grade titanium casing. Dynamic 7-day battery life.',
        price: 299,
        originalPrice: 399,
        discount: 25,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop'
        ],
        category: 'Tech Gadgets',
        stock: 9,
        rating: 4.9,
        numReviews: 18,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        reviews: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-4',
        name: 'Sonic Pods Pro Active',
        description: 'Immersive sound with next-generation adaptive active noise cancellation. Enjoy deep bass, crystal-clear high frequencies, and low-latency spatial audio designed specifically for high-intensity gaming and outdoor exploration.',
        price: 149,
        originalPrice: 199,
        discount: 25,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop'
        ],
        category: 'Tech Gadgets',
        stock: 35,
        rating: 4.7,
        numReviews: 15,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        reviews: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-5',
        name: 'Urban Explorer Tech Backpack',
        description: 'The ultimate weather-resistant commuter backpack. Featuring an isolated laptop vault, expandable storage pockets, modular magnetic strap attachment ports, and high-visibility reflective detailing for night walks.',
        price: 95,
        originalPrice: 135,
        discount: 29,
        images: [
          'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop'
        ],
        category: 'Accessories',
        stock: 12,
        rating: 4.5,
        numReviews: 6,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: false,
        reviews: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-6',
        name: 'Viper Sunset Shades',
        description: 'Channel retro-futurism with these wrap-around sunset glasses. Crafted with polarized UV400 lenses and shatterproof polycarbonate frames. Sleek aerodynamic fit that sits comfortably.',
        price: 59,
        originalPrice: 89,
        discount: 33,
        images: [
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop'
        ],
        category: 'Accessories',
        stock: 45,
        rating: 4.4,
        numReviews: 4,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        reviews: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-7',
        name: 'Alpha Carbon Runner V2',
        description: 'Engineered with an ultra-light carbon fiber speedplate and nitrogen-infused energy rebound midsoles. Made for setting personal records and turning heads on the track.',
        price: 169,
        originalPrice: 229,
        discount: 26,
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop'
        ],
        category: 'Footwear',
        stock: 20,
        rating: 4.7,
        numReviews: 10,
        isFeatured: false,
        isBestSeller: false,
        isNewArrival: true,
        reviews: [],
        createdAt: new Date().toISOString()
      },
      {
        id: 'prod-8',
        name: 'Cyberpunk Cargo Utility Pants',
        description: 'Multi-pocket tactical design constructed with quick-dry ripstop fabric. Adjustable ankle straps, metal carabiner attachments, and loose-fit comfort suited for streetwear enthusiasts.',
        price: 89,
        originalPrice: 129,
        discount: 31,
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop'
        ],
        category: 'Apparel',
        stock: 14,
        rating: 4.5,
        numReviews: 5,
        isFeatured: false,
        isBestSeller: true,
        isNewArrival: false,
        reviews: [],
        createdAt: new Date().toISOString()
      }
    ];
    writeCollection('products', defaultProducts);
    console.log('Seeded Products successfully!');
  }

  // 3. Seed Users
  const usersFile = getFilePath('users');
  if (!fs.existsSync(usersFile) || readCollection('users').length === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const userHashedPassword = bcrypt.hashSync('user123', 10);
    const defaultUsers = [
      {
        id: 'user-admin',
        name: 'Admin Genzmart',
        email: 'admin@genzmart.com',
        password: hashedPassword,
        role: 'admin',
        profilePicture: '',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-gautam',
        name: 'Gautam Sikandar',
        email: 'sikandargoutam98@gmail.com',
        password: userHashedPassword,
        role: 'user',
        profilePicture: '',
        createdAt: new Date().toISOString()
      }
    ];
    writeCollection('users', defaultUsers);
    console.log('Seeded Users successfully!');
  }

  // 4. Seed Coupons
  const couponsFile = getFilePath('coupons');
  if (!fs.existsSync(couponsFile) || readCollection('coupons').length === 0) {
    const defaultCoupons = [
      { id: 'coup-1', code: 'GENZ20', discountType: 'percentage', discountValue: 20, expiryDate: '2027-12-31', active: true, createdAt: new Date().toISOString() },
      { id: 'coup-2', code: 'SUPER50', discountType: 'amount', discountValue: 50, expiryDate: '2027-12-31', active: true, createdAt: new Date().toISOString() },
      { id: 'coup-3', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, expiryDate: '2027-12-31', active: true, createdAt: new Date().toISOString() }
    ];
    writeCollection('coupons', defaultCoupons);
    console.log('Seeded Coupons successfully!');
  }
}
