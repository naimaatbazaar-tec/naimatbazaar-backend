import { Router } from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserStatus,
  getAdminProfile,        // <--- Import this
  updateAdminProfile,     // <--- Import this
  updateAdminPassword,    // <--- Import this
} from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Secure all admin routes
router.use(verifyToken, requireAdmin);

// Admin Profile & Security Routes
router.get('/profile', getAdminProfile);       // <--- Matches api.get('/admin/profile')
router.put('/profile', updateAdminProfile);    // <--- Matches api.put('/admin/profile')
router.put('/password', updateAdminPassword);  // <--- Matches api.put('/admin/password')

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);

export default router;