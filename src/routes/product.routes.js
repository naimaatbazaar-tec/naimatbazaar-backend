import { Router } from 'express';
import { 
  getProducts, 
  getProductBySlug, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);
router.post('/', verifyToken, requireAdmin, upload.array('images', 5), createProduct);

// Added routes for updating and deleting a product by ID (Admin Only)
router.put('/:id', verifyToken, requireAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;