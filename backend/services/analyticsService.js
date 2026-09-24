import { orderRepository } from '../repositories/orderRepository.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

export const analyticsService = {
  async dashboardSummary() {
    const [totalRevenueAgg, totalOrders, totalUsers, totalProducts] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
    ]);
    return {
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
    };
  },

  salesByDay(days) {
    return orderRepository.salesByDay(days);
  },

  topProducts(limit) {
    return orderRepository.topSellingProducts(limit);
  },

  ordersByStatus() {
    return Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  },
};
