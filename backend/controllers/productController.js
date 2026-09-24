import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';
import { productService } from '../services/productService.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await productService.list(req.query);
  success(res, 200, items, meta);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  success(res, 200, product);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getBySlug(req.params.slug);
  success(res, 200, product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body, req.user.role === 'seller' ? req.user : null);
  success(res, 201, product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body, req.user);
  success(res, 200, product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id, req.user);
  success(res, 200, { message: 'Product deleted' });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const product = await productService.adjustStock(req.params.id, Number(req.body.delta));
  success(res, 200, product);
});
