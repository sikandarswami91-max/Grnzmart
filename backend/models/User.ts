import { readCollection, writeCollection } from '../config/db';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  profilePicture?: string; // Base64 or URL
  createdAt: string;
}

export const UserModel = {
  getAll(): IUser[] {
    return readCollection<IUser>('users');
  },

  findOne(query: Partial<IUser>): IUser | null {
    const users = this.getAll();
    const found = users.find((u) => {
      return Object.entries(query).every(([key, value]) => u[key as keyof IUser] === value);
    });
    return found || null;
  },

  findById(id: string): IUser | null {
    return this.findOne({ id });
  },

  create(userData: Omit<IUser, 'id' | 'createdAt'>): IUser {
    const users = this.getAll();
    const newUser: IUser = {
      ...userData,
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeCollection('users', users);
    return newUser;
  },

  findByIdAndUpdate(id: string, updates: Partial<IUser>): IUser | null {
    const users = this.getAll();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    // Don't allow changing id
    delete updates.id;

    users[index] = { ...users[index], ...updates };
    writeCollection('users', users);
    return users[index];
  },

  delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    writeCollection('users', filtered);
    return true;
  }
};
