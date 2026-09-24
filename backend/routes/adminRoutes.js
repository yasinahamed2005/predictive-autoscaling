import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import * as analytics from '../controllers/analyticsController.js';
import * as deal from '../controllers/dealController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();
router.use(protect, restrictTo('admin'));

router.get('/users', admin.listUsers);
router.patch('/users/:id/status', admin.updateUserStatus);
router.patch('/users/:id/approve-seller', admin.approveSeller);

// Deal management
router.get('/deals', deal.getAllDeals);
router.post('/deals', deal.createDeal);
router.get('/deals/:id', deal.getDealById);
router.put('/deals/:id', deal.updateDeal);
router.delete('/deals/:id', deal.deleteDeal);
router.patch('/deals/:id/status', deal.updateDealStatus);

router.get('/analytics/summary', analytics.getDashboardSummary);
router.get('/analytics/sales', analytics.getSalesByDay);
router.get('/analytics/top-products', analytics.getTopProducts);
router.get('/analytics/orders-by-status', analytics.getOrdersByStatus);

export default router;
