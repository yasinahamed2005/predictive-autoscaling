import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { analyticsService } from '../services/analyticsService.js';

export const getDashboardSummary = asyncHandler(async (req, res) => success(res, 200, await analyticsService.dashboardSummary()));
export const getSalesByDay = asyncHandler(async (req, res) => success(res, 200, await analyticsService.salesByDay(Number(req.query.days) || 30)));
export const getTopProducts = asyncHandler(async (req, res) => success(res, 200, await analyticsService.topProducts(Number(req.query.limit) || 10)));
export const getOrdersByStatus = asyncHandler(async (req, res) => success(res, 200, await analyticsService.ordersByStatus()));
