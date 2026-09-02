import express from 'express';
import { getFaqs, createFaq, updateFaq, deleteFaq } from '../controllers/faq.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js'; // <--- Fixed path and filename

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

router.route('/')
  .get(getFaqs)
  .post(verifyToken, adminOnly, createFaq);

router.route('/:id')
  .put(verifyToken, adminOnly, updateFaq)
  .delete(verifyToken, adminOnly, deleteFaq);

export default router;