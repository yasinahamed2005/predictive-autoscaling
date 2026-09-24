import { Router } from 'express';
import * as user from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { addressValidation } from '../validations/orderValidation.js';

const router = Router();
router.use(protect);
router.patch('/profile', user.updateProfile);
router.get('/addresses', user.listAddresses);
router.post('/addresses', addressValidation, user.addAddress);
router.patch('/addresses/:addressId', user.updateAddress);
router.delete('/addresses/:addressId', user.deleteAddress);
export default router;
