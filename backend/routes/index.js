import { Router } from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import brandRoutes from './brandRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import orderRoutes from './orderRoutes.js';
import couponRoutes from './couponRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import userRoutes from './userRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import adminRoutes from './adminRoutes.js';
import dealRoutes from './dealRoutes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

let systemHealthState = {
  isOverloaded: false,
  activeUsers: 10,
  currentPods: 1,
  requiredPods: 1,
  currentRps: 1.5,
  isPredictiveOn: false,
  timestamp: Date.now()
};

router.get('/system-status', (req, res) => {
  if (systemHealthState.isOverloaded) {
    return res.status(503).json({
      success: false,
      error: 'HTTP 503 SERVICE UNAVAILABLE - CAPACITY EXCEEDED',
      data: systemHealthState
    });
  }
  res.json({ success: true, data: systemHealthState });
});

router.post('/system-status', (req, res) => {
  systemHealthState = { ...systemHealthState, ...req.body, timestamp: Date.now() };
  res.json({ success: true, data: systemHealthState });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/seller', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/deals', dealRoutes);

export default router;
