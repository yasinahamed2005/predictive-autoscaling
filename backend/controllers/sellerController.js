import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import Product from '../models/Product.js';
import { parseListQuery, buildMeta } from '../utils/pagination.js';

export const getSellerProducts = asyncHandler(async (req, res) => {
  const { skip, limit, page, sort } = parseListQuery(req.query);
  const filter = { seller: req.user._id };
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);
  success(res, 200, items, buildMeta(total, page, limit));
});

export const getSellerDashboard = asyncHandler(async (req, res) => {
  const [productCount, activeCount, outOfStockCount] = await Promise.all([
    Product.countDocuments({ seller: req.user._id }),
    Product.countDocuments({ seller: req.user._id, isActive: true }),
    Product.countDocuments({ seller: req.user._id, stock: 0 }),
  ]);
  success(res, 200, { productCount, activeCount, outOfStockCount });
});
