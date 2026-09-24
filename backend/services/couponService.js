import Coupon from '../models/Coupon.js';
import { ApiError } from '../utils/ApiError.js';

export const couponService = {
  list() {
    return Coupon.find().sort('-createdAt');
  },

  create(data) {
    return Coupon.create(data);
  },

  update(id, data) {
    return Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  remove(id) {
    return Coupon.findByIdAndDelete(id);
  },

  // Validates a coupon against an order subtotal and returns the discount
  // amount — used by both the "apply coupon" endpoint and order creation.
  async validateAndCompute(code, subtotal) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) throw ApiError.notFound('Invalid coupon code');
    if (coupon.expiresAt < new Date()) throw ApiError.badRequest('This coupon has expired');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) throw ApiError.badRequest('This coupon has reached its usage limit');
    if (subtotal < coupon.minOrderValue) throw ApiError.badRequest(`Minimum order value for this coupon is ₹${coupon.minOrderValue}`);

    let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);

    return { coupon, discount: Math.round(discount) };
  },

  async markUsed(code) {
    await Coupon.updateOne({ code: code.toUpperCase() }, { $inc: { usedCount: 1 } });
  },
};
