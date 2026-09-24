import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../validations/authValidation.js';

const router = Router();

router.post('/register', authLimiter, registerValidation, auth.register);
router.post('/login', authLimiter, loginValidation, auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', auth.logout);
router.get('/me', protect, auth.me);

router.post('/google', authLimiter, auth.googleLogin);
router.post('/firebase-phone', authLimiter, auth.firebasePhoneLogin);

router.post('/forgot-password', authLimiter, forgotPasswordValidation, auth.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, auth.resetPassword);

export default router;
