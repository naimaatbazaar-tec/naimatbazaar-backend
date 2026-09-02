import { Router } from 'express';
import { getAdminDashboardStats } from '../controllers/dashboard.controller.js';
// Import your auth/admin middleware if you use them:
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/').get(getAdminDashboardStats);

export default router;