import { Router } from 'express';
import * as cart from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', cart.getCart);
router.post('/items', cart.addToCart);
router.patch('/items/:productId', cart.updateCartItem);
router.delete('/items/:productId', cart.removeCartItem);
router.delete('/', cart.clearCart);
export default router;
