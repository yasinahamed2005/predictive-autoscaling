import { Router } from 'express';
import * as category from '../controllers/categoryController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.get('/', category.listCategories);
router.post('/', protect, restrictTo('admin'), category.createCategory);
router.patch('/:id', protect, restrictTo('admin'), category.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), category.deleteCategory);
export default router;
