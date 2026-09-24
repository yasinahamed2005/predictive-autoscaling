import { Router } from 'express';
import * as payment from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.post('/create-order', protect, payment.createPaymentOrder);
router.post('/verify', protect, payment.verifyPayment);
router.post('/webhook', payment.paymentWebhook); // gateway calls this directly, no user session
export default router;
