import { Request, Response } from 'express';
import { ProductModel } from '../models/Product';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    let products = ProductModel.getAll();

    const {
      category,
      search,
      sort,
      isFeatured,
      isBestSeller,
      isNewArrival,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = req.query;

    // 1. Search filter
    if (search) {
      const searchTerm = String(search).toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
      );
    }

    // 2. Category filter
    if (category && category !== 'All') {
      products = products.filter(
        (p) => p.category.toLowerCase() === String(category).toLowerCase()
      );
    }

    // 3. Flags filter
    if (isFeatured === 'true') {
      products = products.filter((p) => p.isFeatured);
    }
    if (isBestSeller === 'true') {
      products = products.filter((p) => p.isBestSeller);
    }
    if (isNewArrival === 'true') {
      products = products.filter((p) => p.isNewArrival);
    }

    // 4. Price range filter
    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    // 5. Sorting
    if (sort) {
      const sortStr = String(sort);
      if (sortStr === 'price-asc') {
        products.sort((a, b) => a.price - b.price);
      } else if (sortStr === 'price-desc') {
        products.sort((a, b) => b.price - a.price);
      } else if (sortStr === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      } else if (sortStr === 'latest') {
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      // Default: latest
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // 6. Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const total = products.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedProducts.length,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products: paginatedProducts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = ProductModel.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Fetch related products (same category, excluding current product)
    const allProducts = ProductModel.getAll();
    const related = allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);

    res.status(200).json({
      success: true,
      product,
      related
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Admin Only - Create
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      images,
      category,
      stock,
      isFeatured,
      isBestSeller,
      isNewArrival
    } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      res.status(400).json({ success: false, message: 'Required fields missing' });
      return;
    }

    const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const newProduct = ProductModel.create({
      name,
      description,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      discount,
      images: images && images.length ? images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'],
      category,
      stock: Number(stock),
      isFeatured: isFeatured === true || isFeatured === 'true',
      isBestSeller: isBestSeller === true || isBestSeller === 'true',
      isNewArrival: isNewArrival === true || isNewArrival === 'true'
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Admin Only - Update
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const existing = ProductModel.findById(productId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const {
      name,
      description,
      price,
      originalPrice,
      images,
      category,
      stock,
      isFeatured,
      isBestSeller,
      isNewArrival
    } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (price !== undefined) {
      updates.price = Number(price);
      const oPrice = originalPrice !== undefined ? Number(originalPrice) : existing.originalPrice;
      updates.discount = oPrice ? Math.round(((oPrice - Number(price)) / oPrice) * 100) : 0;
    }
    if (originalPrice !== undefined) {
      updates.originalPrice = Number(originalPrice);
      const currPrice = price !== undefined ? Number(price) : existing.price;
      updates.discount = Number(originalPrice) ? Math.round(((Number(originalPrice) - currPrice) / Number(originalPrice)) * 100) : 0;
    }
    if (images) updates.images = images;
    if (category) updates.category = category;
    if (stock !== undefined) updates.stock = Number(stock);
    if (isFeatured !== undefined) updates.isFeatured = isFeatured === true || isFeatured === 'true';
    if (isBestSeller !== undefined) updates.isBestSeller = isBestSeller === true || isBestSeller === 'true';
    if (isNewArrival !== undefined) updates.isNewArrival = isNewArrival === true || isNewArrival === 'true';

    const updated = ProductModel.findByIdAndUpdate(productId, updates);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Admin Only - Delete
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = ProductModel.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// User - Add Review
export const addProductReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (rating === undefined || !comment) {
      res.status(400).json({ success: false, message: 'Please provide rating and comment' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const product = ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find((r) => r.user === req.user!.email);
    if (alreadyReviewed) {
      res.status(400).json({ success: false, message: 'Product already reviewed by you' });
      return;
    }

    const updated = ProductModel.addReview(productId, {
      user: req.user.email,
      userName: req.user.name,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      product: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// User/Admin - Delete Review
export const deleteProductReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, reviewId } = req.params;

    const product = ProductModel.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const review = product.reviews.find((r) => r.id === reviewId);
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }

    // Check permissions (must be reviewer or admin)
    if (req.user?.role !== 'admin' && review.user !== req.user?.email) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
      return;
    }

    const updated = ProductModel.deleteReview(productId, reviewId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      product: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
