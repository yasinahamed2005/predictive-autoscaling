import { productRepository, buildProductFilter } from '../repositories/productRepository.js';
import { parseListQuery, buildMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';

export const productService = {
  async list(query) {
    const { skip, limit, sort, page } = parseListQuery(query, { defaultSort: '-createdAt' });
    const filter = buildProductFilter(query);
    const { items, total } = await productRepository.findMany({ filter, sort, skip, limit });
    return { items, meta: buildMeta(total, page, limit) };
  },

  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  create(data, seller) {
    return productRepository.create({ ...data, seller: seller?._id });
  },

  async update(id, data, requester) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    if (requester.role === 'seller' && String(product.seller) !== String(requester._id)) {
      throw ApiError.forbidden('You can only edit your own products');
    }
    return productRepository.updateById(id, data);
  },

  async remove(id, requester) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    if (requester.role === 'seller' && String(product.seller) !== String(requester._id)) {
      throw ApiError.forbidden('You can only delete your own products');
    }
    return productRepository.deleteById(id);
  },

  async adjustStock(id, delta) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    product.stock = Math.max(0, product.stock + delta);
    await product.save();
    return product;
  },
};
