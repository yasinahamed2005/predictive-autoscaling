import { Router } from 'express';
import * as review from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { createReviewValidation } from '../validations/productValidation.js';

const router = Router({ mergeParams: true }); // inherits :productId from parent router

router.get('/', review.listReviews);
router.post('/', protect, createReviewValidation, review.createReview);
router.delete('/:id', protect, review.deleteReview);

export default router;
