import Wishlist from '../models/Wishlist.js';

export const wishlistService = {
  async get(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products', 'name images price mrp ratingAvg slug');
    if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
    return wishlist;
  },

  async toggle(userId, productId) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });

    const exists = wishlist.products.some((p) => String(p) === String(productId));
    if (exists) wishlist.products = wishlist.products.filter((p) => String(p) !== String(productId));
    else wishlist.products.push(productId);

    await wishlist.save();
    return wishlist.populate('products', 'name images price mrp ratingAvg slug');
  },
};
