import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';
import { parseListQuery, buildMeta } from '../utils/pagination.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { skip, limit, page, sort } = parseListQuery(req.query);
  const filter = req.query.role ? { role: req.query.role } : {};
  const [items, total] = await Promise.all([
    User.find(filter).select('-password').sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  success(res, 200, items, buildMeta(total, page, limit));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  success(res, 200, user);
});

export const approveSeller = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: 'seller', 'sellerProfile.isApproved': true },
    { new: true }
  ).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  success(res, 200, user);
});
