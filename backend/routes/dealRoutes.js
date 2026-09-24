import { Router } from 'express';
import * as deal from '../controllers/dealController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = Router();

// Public route for customers to fetch active deals
router.get('/active', deal.getActiveDeals);

// Admin-protected routes
router.use(protect, restrictTo('admin'));

router.get('/', deal.getAllDeals);
router.post('/', deal.createDeal);
router.get('/:id', deal.getDealById);
router.put('/:id', deal.updateDeal);
router.delete('/:id', deal.deleteDeal);
router.patch('/:id/status', deal.updateDealStatus);

export default router;
