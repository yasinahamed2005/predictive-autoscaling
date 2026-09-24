import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { couponService } from '../services/couponService.js';
import Cart from '../models/Cart.js';
import { ApiError } from '../utils/ApiError.js';

export const listCoupons = asyncHandler(async (req, res) => success(res, 200, await couponService.list()));
export const createCoupon = asyncHandler(async (req, res) => success(res, 201, await couponService.create(req.body)));
export const updateCoupon = asyncHandler(async (req, res) => success(res, 200, await couponService.update(req.params.id, req.body)));
export const deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.remove(req.params.id);
  success(res, 200, { message: 'Coupon deleted' });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'price');
  if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');

  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const { discount } = await couponService.validateAndCompute(req.body.code, subtotal);

  cart.couponCode = req.body.code.toUpperCase();
  await cart.save();

  success(res, 200, { subtotal, discount, total: subtotal - discount });
});
