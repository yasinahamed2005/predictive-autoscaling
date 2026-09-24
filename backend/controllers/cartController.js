import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { cartService } from '../services/cartService.js';

export const getCart = asyncHandler(async (req, res) => success(res, 200, await cartService.getCart(req.user._id)));
export const addToCart = asyncHandler(async (req, res) =>
  success(res, 200, await cartService.addItem(req.user._id, req.body.productId, req.body.quantity)));
export const updateCartItem = asyncHandler(async (req, res) =>
  success(res, 200, await cartService.updateItem(req.user._id, req.params.productId, req.body.quantity)));
export const removeCartItem = asyncHandler(async (req, res) =>
  success(res, 200, await cartService.removeItem(req.user._id, req.params.productId)));
export const clearCart = asyncHandler(async (req, res) => {
  await cartService.clear(req.user._id);
  success(res, 200, { message: 'Cart cleared' });
});
