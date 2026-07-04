import { readCollection, writeCollection } from '../config/db';

export interface IWishlist {
  user: string; // user email
  productIds: string[];
}

export const WishlistModel = {
  getAll(): IWishlist[] {
    return readCollection<IWishlist>('wishlists');
  },

  findOne(user: string): IWishlist {
    const wishlists = this.getAll();
    let wishlist = wishlists.find((w) => w.user === user);
    if (!wishlist) {
      // Lazy init
      wishlist = { user, productIds: [] };
      wishlists.push(wishlist);
      writeCollection('wishlists', wishlists);
    }
    return wishlist;
  },

  save(user: string, productIds: string[]): IWishlist {
    const wishlists = this.getAll();
    const index = wishlists.findIndex((w) => w.user === user);
    if (index !== -1) {
      wishlists[index].productIds = productIds;
    } else {
      wishlists.push({ user, productIds });
    }
    writeCollection('wishlists', wishlists);
    return { user, productIds };
  }
};
