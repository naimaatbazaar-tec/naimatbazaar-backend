import { Router } from 'express';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller.js';
// Import your auth middleware if required:
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = Router();

// Public read routes
router.route('/').get(getCategories);

// Admin write/modify routes (add protect, admin middleware if you use them)
router.route('/').post(createCategory);
router.route('/:id').put(updateCategory).delete(deleteCategory);

export default router;