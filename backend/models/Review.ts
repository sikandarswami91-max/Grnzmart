import { readCollection, writeCollection } from '../config/db';
import { ProductModel } from './Product';

export interface IReview {
  id: string;
  user: string; // user email
  userName: string;
  product: string; // product ID
  rating: number;
  comment: string;
  createdAt: string;
}

export const ReviewModel = {
  getAll(): IReview[] {
    const products = ProductModel.getAll();
    const reviews: IReview[] = [];
    products.forEach((p) => {
      p.reviews.forEach((r) => {
        reviews.push({
          ...r,
          product: p.id
        });
      });
    });
    return reviews;
  },

  create(productId: string, reviewData: Omit<IReview, 'id' | 'product' | 'createdAt'>): IReview | null {
    const updatedProduct = ProductModel.addReview(productId, reviewData);
    if (!updatedProduct) return null;
    const latestReview = updatedProduct.reviews[updatedProduct.reviews.length - 1];
    return {
      ...latestReview,
      product: productId
    };
  },

  delete(productId: string, reviewId: string): boolean {
    const updatedProduct = ProductModel.deleteReview(productId, reviewId);
    return !!updatedProduct;
  }
};
