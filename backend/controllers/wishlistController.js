import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { wishlistService } from '../services/wishlistService.js';

export const getWishlist = asyncHandler(async (req, res) => success(res, 200, await wishlistService.get(req.user._id)));
export const toggleWishlistItem = asyncHandler(async (req, res) =>
  success(res, 200, await wishlistService.toggle(req.user._id, req.body.productId)));
