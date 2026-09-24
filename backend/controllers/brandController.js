import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import Brand from '../models/Brand.js';

export const listBrands = asyncHandler(async (req, res) => {
  success(res, 200, await Brand.find({ isActive: true }).sort('name'));
});
export const createBrand = asyncHandler(async (req, res) => success(res, 201, await Brand.create(req.body)));
export const updateBrand = asyncHandler(async (req, res) =>
  success(res, 200, await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
export const deleteBrand = asyncHandler(async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  success(res, 200, { message: 'Brand deleted' });
});
