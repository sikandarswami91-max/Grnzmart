import { readCollection, writeCollection } from '../config/db';

export interface ICartItem {
  id: string; // product id
  quantity: number;
}

export interface ICart {
  user: string; // user email
  items: ICartItem[];
}

export const CartModel = {
  getAll(): ICart[] {
    return readCollection<ICart>('carts');
  },

  findOne(user: string): ICart {
    const carts = this.getAll();
    let cart = carts.find((c) => c.user === user);
    if (!cart) {
      // Lazy init
      cart = { user, items: [] };
      carts.push(cart);
      writeCollection('carts', carts);
    }
    return cart;
  },

  save(user: string, items: ICartItem[]): ICart {
    const carts = this.getAll();
    const index = carts.findIndex((c) => c.user === user);
    if (index !== -1) {
      carts[index].items = items;
    } else {
      carts.push({ user, items });
    }
    writeCollection('carts', carts);
    return { user, items };
  },

  clear(user: string): void {
    const carts = this.getAll();
    const index = carts.findIndex((c) => c.user === user);
    if (index !== -1) {
      carts[index].items = [];
      writeCollection('carts', carts);
    }
  }
};
