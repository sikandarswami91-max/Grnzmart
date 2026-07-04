import { readCollection, writeCollection } from '../config/db';

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export const CategoryModel = {
  getAll(): ICategory[] {
    return readCollection<ICategory>('categories');
  },

  findOne(query: Partial<ICategory>): ICategory | null {
    const categories = this.getAll();
    const found = categories.find((c) => {
      return Object.entries(query).every(([key, value]) => c[key as keyof ICategory] === value);
    });
    return found || null;
  },

  findById(id: string): ICategory | null {
    return this.findOne({ id });
  },

  create(categoryData: Omit<ICategory, 'id'>): ICategory {
    const categories = this.getAll();
    const newCategory: ICategory = {
      ...categoryData,
      id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    categories.push(newCategory);
    writeCollection('categories', categories);
    return newCategory;
  },

  findByIdAndUpdate(id: string, updates: Partial<ICategory>): ICategory | null {
    const categories = this.getAll();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    delete updates.id;
    categories[index] = { ...categories[index], ...updates };
    writeCollection('categories', categories);
    return categories[index];
  },

  delete(id: string): boolean {
    const categories = this.getAll();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;
    writeCollection('categories', filtered);
    return true;
  }
};
