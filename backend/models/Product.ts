import { readCollection, writeCollection } from '../config/db';

export interface IReview {
  id: string;
  user: string; // email
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  reviews: IReview[];
  createdAt: string;
}

export const ProductModel = {
  getAll(): IProduct[] {
    return readCollection<IProduct>('products');
  },

  findOne(query: Partial<IProduct>): IProduct | null {
    const products = this.getAll();
    const found = products.find((p) => {
      return Object.entries(query).every(([key, value]) => p[key as keyof IProduct] === value);
    });
    return found || null;
  },

  findById(id: string): IProduct | null {
    return this.findOne({ id });
  },

  create(productData: Omit<IProduct, 'id' | 'createdAt' | 'rating' | 'numReviews' | 'reviews'>): IProduct {
    const products = this.getAll();
    const newProduct: IProduct = {
      ...productData,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rating: 0,
      numReviews: 0,
      reviews: [],
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    writeCollection('products', products);
    return newProduct;
  },

  findByIdAndUpdate(id: string, updates: Partial<IProduct>): IProduct | null {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    delete updates.id;
    products[index] = { ...products[index], ...updates };
    writeCollection('products', products);
    return products[index];
  },

  delete(id: string): boolean {
    const products = this.getAll();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;
    writeCollection('products', filtered);
    return true;
  },

  addReview(productId: string, review: Omit<IReview, 'id' | 'createdAt'>): IProduct | null {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const product = products[index];
    const newReview: IReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    
    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalRating / product.numReviews).toFixed(1));

    products[index] = product;
    writeCollection('products', products);
    return product;
  },

  deleteReview(productId: string, reviewId: string): IProduct | null {
    const products = this.getAll();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const product = products[index];
    product.reviews = product.reviews.filter((r) => r.id !== reviewId);
    product.numReviews = product.reviews.length;

    if (product.numReviews > 0) {
      const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = Number((totalRating / product.numReviews).toFixed(1));
    } else {
      product.rating = 0;
    }

    products[index] = product;
    writeCollection('products', products);
    return product;
  }
};
