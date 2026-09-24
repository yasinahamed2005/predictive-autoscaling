import { Router } from 'express';
import * as wishlist from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', wishlist.getWishlist);
router.post('/toggle', wishlist.toggleWishlistItem);
export default router;
