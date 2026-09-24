import { Router } from 'express';
import * as product from '../controllers/productController.js';
import { protect, restrictTo, optionalAuth } from '../middleware/auth.js';
import { createProductValidation } from '../validations/productValidation.js';
import reviewRoutes from './reviewRoutes.js';

const router = Router();

router.get('/', optionalAuth, product.listProducts);
router.get('/slug/:slug', product.getProductBySlug);
router.get('/:id', product.getProduct);

router.use('/:productId/reviews', reviewRoutes);

router.post('/', protect, restrictTo('seller', 'admin'), createProductValidation, product.createProduct);
router.patch('/:id', protect, restrictTo('seller', 'admin'), product.updateProduct);
router.delete('/:id', protect, restrictTo('seller', 'admin'), product.deleteProduct);
router.patch('/:id/stock', protect, restrictTo('seller', 'admin'), product.adjustStock);

export default router;
