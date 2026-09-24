import { Router } from 'express';
import * as seller from '../controllers/sellerController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.use(protect, restrictTo('seller'));
router.get('/products', seller.getSellerProducts);
router.get('/dashboard', seller.getSellerDashboard);
export default router;
