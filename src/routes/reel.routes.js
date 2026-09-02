import express from 'express';
import { getReels, createReel, updateReel, deleteReel } from '../controllers/reel.controller.js';
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
  .get(getReels)
  .post(verifyToken, adminOnly, createReel);

router.route('/:id')
  .put(verifyToken, adminOnly, updateReel)
  .delete(verifyToken, adminOnly, deleteReel);

export default router;