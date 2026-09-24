import Review from '../models/Review.js';
import { productRepository } from '../repositories/productRepository.js';
import { ApiError } from '../utils/ApiError.js';

export const reviewService = {
  list(productId) {
    return Review.find({ product: productId }).populate('user', 'name avatar').sort('-createdAt');
  },

  async create(productId, userId, { rating, title, comment, images, orderId }) {
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) throw ApiError.conflict('You have already reviewed this product');

    const review = await Review.create({
      product: productId, user: userId, rating, title, comment, images,
      order: orderId, isVerifiedPurchase: Boolean(orderId),
    });
    await productRepository.recalculateRating(productId);
    return review;
  },

  async remove(id, requester) {
    const review = await Review.findById(id);
    if (!review) throw ApiError.notFound('Review not found');
    if (String(review.user) !== String(requester._id) && requester.role !== 'admin') {
      throw ApiError.forbidden('You can only delete your own review');
    }
    await review.deleteOne();
    await productRepository.recalculateRating(review.product);
  },
};
