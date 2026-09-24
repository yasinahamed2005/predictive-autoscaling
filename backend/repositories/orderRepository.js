import Order from '../models/Order.js';

export const orderRepository = {
  create(data) {
    return Order.create(data);
  },

  findById(id) {
    return Order.findById(id).populate('user', 'name email phone');
  },

  async findForUser(userId, { skip = 0, limit = 20 }) {
    const filter = { user: userId };
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },

  async findForSeller(sellerId, { skip = 0, limit = 20 }) {
    const filter = { 'items.seller': sellerId };
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },

  async findAll({ filter = {}, skip = 0, limit = 20 }) {
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },

  updateStatus(id, status, note) {
    return Order.findByIdAndUpdate(
      id,
      { status, $push: { statusHistory: { status, note, at: new Date() } } },
      { new: true }
    );
  },

  // Sales-by-day aggregation for the admin analytics dashboard.
  salesByDay(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Order.aggregate([
      { $match: { createdAt: { $gte: since }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  topSellingProducts(limit = 10) {
    return Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', unitsSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { unitsSold: -1 } },
      { $limit: limit },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', image: { $arrayElemAt: ['$product.images.url', 0] }, unitsSold: 1, revenue: 1 } },
    ]);
  },
};
