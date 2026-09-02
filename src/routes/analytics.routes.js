import { Router } from 'express';
import { getAdminAnalytics } from '../controllers/analytics.controller.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/').get(getAdminAnalytics);

export default router;