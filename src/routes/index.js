import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import adminRoutes from './admin.routes.js';
import categoryRoutes from './category.routes.js';
import analyticsRoutes from './analytics.routes.js';
import couponRoutes from './coupon.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import faqRoutes from './faq.routes.js';
import reviewRoutes from './review.routes.js';
import reelRoutes from './reel.routes.js'; // <--- Import reel routes

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

router.use('/categories', categoryRoutes);
router.use('/admin/categories', categoryRoutes);

router.use('/orders', orderRoutes);
router.use('/admin/orders', orderRoutes);

router.use('/faqs', faqRoutes);
router.use('/admin/faqs', faqRoutes);

router.use('/reviews', reviewRoutes);
router.use('/admin/reviews', reviewRoutes);

router.use('/reels', reelRoutes);         // <--- Mount public reels
router.use('/admin/reels', reelRoutes);   // <--- Mount admin reels CRUD

router.use('/admin/analytics', analyticsRoutes);
router.use('/admin/coupons', couponRoutes);
router.use('/admin/dashboard', dashboardRoutes);

router.use('/admin', adminRoutes);

export default router;