import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

const populate = (query) => query.populate('items.product', 'name images price mrp stock slug');

export const cartService = {
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return populate(Cart.findById(cart._id));
  },

  async addItem(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) throw ApiError.notFound('Product not found');
    if (product.stock < quantity) throw ApiError.badRequest('Not enough stock available');

    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });

    const existing = cart.items.find((i) => String(i.product) === String(productId));
    if (existing) existing.quantity += quantity;
    else cart.items.push({ product: productId, quantity, priceAtAdd: product.price });

    await cart.save();
    return populate(Cart.findById(cart._id));
  },

  async updateItem(userId, productId, quantity) {
    if (quantity < 1) throw ApiError.badRequest('Quantity must be at least 1');
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw ApiError.notFound('Cart not found');

    const item = cart.items.find((i) => String(i.product) === String(productId));
    if (!item) throw ApiError.notFound('Item not in cart');
    item.quantity = quantity;
    await cart.save();
    return populate(Cart.findById(cart._id));
  },

  async removeItem(userId, productId) {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    );
    if (!cart) throw ApiError.notFound('Cart not found');
    return populate(Cart.findById(cart._id));
  },

  async clear(userId) {
    return Cart.findOneAndUpdate({ user: userId }, { items: [], couponCode: null }, { new: true });
  },
};
