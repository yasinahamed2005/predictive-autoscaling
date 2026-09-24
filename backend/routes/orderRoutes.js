import { Router } from 'express';
import * as order from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { createOrderValidation } from '../validations/orderValidation.js';

const router = Router();
router.use(protect);

router.post('/', createOrderValidation, order.createOrder);
router.get('/my', order.getMyOrders);
router.get('/:id', order.getOrder);
router.post('/:id/cancel', order.cancelOrder);

router.get('/seller/mine', restrictTo('seller'), order.getSellerOrders);

router.get('/', restrictTo('admin'), order.getAllOrders);
router.patch('/:id/status', restrictTo('admin', 'seller'), order.updateOrderStatus);

export default router;
