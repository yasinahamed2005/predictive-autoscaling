import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Deal from '../models/Deal.js';

export const getActiveDeals = asyncHandler(async (req, res) => {
  const now = new Date();
  const deals = await Deal.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ displayOrder: 1, createdAt: -1 })
    .populate({
      path: 'products',
      populate: ['category', 'brand'],
    });

  success(res, 200, deals);
});

export const getAllDeals = asyncHandler(async (req, res) => {
  const deals = await Deal.find()
    .sort({ displayOrder: 1, createdAt: -1 })
    .populate('products', 'name price mrp images stock');

  success(res, 200, deals);
});

export const getDealById = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id).populate('products');
  if (!deal) throw ApiError.notFound('Deal not found');
  success(res, 200, deal);
});

export const createDeal = asyncHandler(async (req, res) => {
  const { title, description, banner, products, discountPercentage, startDate, endDate, isActive, displayOrder } = req.body;
  
  const deal = await Deal.create({
    title,
    description,
    banner,
    products: products || [],
    discountPercentage: discountPercentage || 0,
    startDate: startDate || new Date(),
    endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: isActive !== undefined ? isActive : true,
    displayOrder: displayOrder || 0,
  });

  const populated = await Deal.findById(deal._id).populate('products');
  success(res, 201, populated);
});

export const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('products');
  if (!deal) throw ApiError.notFound('Deal not found');
  success(res, 200, deal);
});

export const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findByIdAndDelete(req.params.id);
  if (!deal) throw ApiError.notFound('Deal not found');
  success(res, 200, { message: 'Deal deleted successfully' });
});

export const updateDealStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const deal = await Deal.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).populate('products');
  if (!deal) throw ApiError.notFound('Deal not found');
  success(res, 200, deal);
});
