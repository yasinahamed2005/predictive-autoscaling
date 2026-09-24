import { Router } from 'express';
import * as coupon from '../controllers/couponController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.post('/apply', protect, coupon.applyCoupon);
router.get('/', protect, restrictTo('admin'), coupon.listCoupons);
router.post('/', protect, restrictTo('admin'), coupon.createCoupon);
router.patch('/:id', protect, restrictTo('admin'), coupon.updateCoupon);
router.delete('/:id', protect, restrictTo('admin'), coupon.deleteCoupon);
export default router;
