import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { orderService } from '../services/orderService.js';
import { parseListQuery, buildMeta } from '../utils/pagination.js';

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createFromCart(req.user._id, req.body);
  success(res, 201, order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { skip, limit, page } = parseListQuery(req.query);
  const { items, total } = await orderService.listForUser(req.user._id, { skip, limit });
  success(res, 200, items, buildMeta(total, page, limit));
});

export const getOrder = asyncHandler(async (req, res) => success(res, 200, await orderService.getById(req.params.id)));

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancel(req.params.id, req.user._id, req.body.reason);
  success(res, 200, order);
});

// --- Seller ---
export const getSellerOrders = asyncHandler(async (req, res) => {
  const { skip, limit, page } = parseListQuery(req.query);
  const { items, total } = await orderService.listForSeller(req.user._id, { skip, limit });
  success(res, 200, items, buildMeta(total, page, limit));
});

// --- Admin ---
export const getAllOrders = asyncHandler(async (req, res) => {
  const { skip, limit, page } = parseListQuery(req.query);
  const { items, total } = await orderService.listAll({ ...req.query, skip, limit });
  success(res, 200, items, buildMeta(total, page, limit));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status, req.body.note);
  success(res, 200, order);
});
