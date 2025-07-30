import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminAuth';
import { validationMiddleware } from '../middleware/validation';
import { ProductValidators } from '../validators/ProductValidators';

const router = Router();
const productController = new ProductController();

// Публичные роуты (чтение)
router.get('/search', ProductValidators.search, validationMiddleware, productController.searchProducts.bind(productController));
router.get('/category/:categoryId', ProductValidators.getById, validationMiddleware, productController.getProductsByCategory.bind(productController));
router.get('/sku/:sku', productController.getProductBySku.bind(productController));
router.get('/:id', ProductValidators.getById, validationMiddleware, productController.getProductById.bind(productController));
router.get('/', productController.getAllProducts.bind(productController));

// Защищенные роуты (только для администраторов)
router.post('/', authMiddleware, adminMiddleware, ProductValidators.createProduct, validationMiddleware, productController.createProduct.bind(productController));
router.put('/:id', authMiddleware, adminMiddleware, ProductValidators.updateProduct, validationMiddleware, productController.updateProduct.bind(productController));
router.patch('/:id/quantity', authMiddleware, adminMiddleware, ProductValidators.updateQuantity, validationMiddleware, productController.updateQuantity.bind(productController));
router.delete('/:id', authMiddleware, adminMiddleware, ProductValidators.getById, validationMiddleware, productController.deleteProduct.bind(productController));

export default router;
