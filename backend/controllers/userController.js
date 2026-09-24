import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true, runValidators: true });
  success(res, 200, user.toSafeObject());
});

export const listAddresses = asyncHandler(async (req, res) => success(res, 200, req.user.addresses));

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
  user.addresses.push(req.body);
  await user.save();
  success(res, 201, user.addresses);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('Address not found');
  if (req.body.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
  Object.assign(address, req.body);
  await user.save();
  success(res, 200, user.addresses);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => String(a._id) !== req.params.addressId);
  await user.save();
  success(res, 200, user.addresses);
});
