import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = CategoryModel.getAll();
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      res.status(400).json({ success: false, message: 'Please provide category name and image URL' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check duplication
    const existing = CategoryModel.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: 'Category already exists' });
      return;
    }

    const category = CategoryModel.create({ name, slug, image });

    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image } = req.body;
    const categoryId = req.params.id;

    const existing = CategoryModel.findById(categoryId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    const updates: any = {};
    if (name) {
      updates.name = name;
      updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (image) updates.image = image;

    const updated = CategoryModel.findByIdAndUpdate(categoryId, updates);

    res.status(200).json({ success: true, message: 'Category updated successfully', category: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = CategoryModel.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
