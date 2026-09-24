import Product from '../models/Product.js';

// Encapsulates all Product query logic so services (and future callers,
// e.g. a GraphQL layer) don't build Mongoose queries by hand.
export const productRepository = {
  async findMany({ filter = {}, sort = { createdAt: -1 }, skip = 0, limit = 20 }) {
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug').populate('brand', 'name logo').lean(),
      Product.countDocuments(filter),
    ]);
    return { items, total };
  },

  findById(id) {
    return Product.findById(id).populate('category', 'name slug').populate('brand', 'name logo');
  },

  findBySlug(slug) {
    return Product.findOne({ slug }).populate('category', 'name slug').populate('brand', 'name logo');
  },

  create(data) {
    return Product.create(data);
  },

  updateById(id, data) {
    return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  deleteById(id) {
    return Product.findByIdAndDelete(id);
  },

  decrementStock(id, quantity, session) {
    return Product.findOneAndUpdate(
      { _id: id, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, session }
    );
  },

  incrementStock(id, quantity, session) {
    return Product.findByIdAndUpdate(id, { $inc: { stock: quantity } }, { new: true, session });
  },

  // Recomputes rating aggregates from the Review collection —
  // called after a review is created/updated/deleted.
  async recalculateRating(productId) {
    const Review = (await import('../models/Review.js')).default;
    const [agg] = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return Product.findByIdAndUpdate(productId, {
      ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0,
      ratingCount: agg ? agg.count : 0,
    });
  },
};

// Builds a Mongo filter object from product-listing query params:
// ?category=electronics&brand=samsung&minPrice=100&maxPrice=5000&tag=trending&q=search
export const buildProductFilter = (query) => {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = query.brand;
  if (query.seller) filter.seller = query.seller;
  if (query.tag) filter.tags = query.tag;
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.q) filter.$text = { $search: query.q };
  return filter;
};
