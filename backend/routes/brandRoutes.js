import { Router } from 'express';
import * as brand from '../controllers/brandController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.get('/', brand.listBrands);
router.post('/', protect, restrictTo('admin'), brand.createBrand);
router.patch('/:id', protect, restrictTo('admin'), brand.updateBrand);
router.delete('/:id', protect, restrictTo('admin'), brand.deleteBrand);
export default router;
