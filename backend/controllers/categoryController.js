import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import Category from '../models/Category.js';

export const listCategories = asyncHandler(async (req, res) => {
  success(res, 200, await Category.find({ isActive: true }).sort('name'));
});
export const createCategory = asyncHandler(async (req, res) => success(res, 201, await Category.create(req.body)));
export const updateCategory = asyncHandler(async (req, res) =>
  success(res, 200, await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })));
export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  success(res, 200, { message: 'Category deleted' });
});
