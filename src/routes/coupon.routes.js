import { Router } from 'express';
import { 
  getCoupons, 
  createCoupon, 
  deleteCoupon 
} from '../controllers/coupon.controller.js';
// Import your auth middleware if required:
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

router.route('/').get(getCoupons).post(createCoupon);
router.route('/:id').delete(deleteCoupon);

export default router;