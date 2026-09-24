import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { reviewService } from '../services/reviewService.js';

export const listReviews = asyncHandler(async (req, res) => success(res, 200, await reviewService.list(req.params.productId)));
export const createReview = asyncHandler(async (req, res) =>
  success(res, 201, await reviewService.create(req.params.productId, req.user._id, req.body)));
export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.remove(req.params.id, req.user);
  success(res, 200, { message: 'Review deleted' });
});
