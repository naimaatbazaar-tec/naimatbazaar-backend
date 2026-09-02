import express from 'express';
import { getReviews, createReview, updateReview, deleteReview } from '../controllers/review.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

router.route('/')
  .get(getReviews)
  .post(verifyToken, adminOnly, createReview);

router.route('/:id')
  .put(verifyToken, adminOnly, updateReview)
  .delete(verifyToken, adminOnly, deleteReview);

export default router;