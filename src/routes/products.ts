import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminAuth';
import { validationMiddleware } from '../middleware/validation';
import { ProductValidators } from '../validators/ProductValidators';
import { uploadProductImage, uploadImage, handleMulterError } from '../middleware/upload';

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
router.put('/:id', authMiddleware, adminMiddleware, ProductValidators.getById, ProductValidators.updateProduct, validationMiddleware, productController.updateProduct.bind(productController));
router.patch('/:id/quantity', authMiddleware, adminMiddleware, ProductValidators.updateQuantity, validationMiddleware, productController.updateQuantity.bind(productController));
router.delete('/:id', authMiddleware, adminMiddleware, ProductValidators.getById, validationMiddleware, productController.deleteProduct.bind(productController));

// Роуты для управления категориями товаров
router.get('/:id/categories', ProductValidators.getById, validationMiddleware, productController.getProductCategories.bind(productController));
router.post('/:id/categories', authMiddleware, adminMiddleware, ProductValidators.addToCategory, validationMiddleware, productController.addProductToCategory.bind(productController));
router.delete('/:id/categories/:categoryId', authMiddleware, adminMiddleware, ProductValidators.removeFromCategory, validationMiddleware, productController.removeProductFromCategory.bind(productController));

// Роуты для управления правилами опросника
router.get('/:id/vitamin-rules', ProductValidators.getById, validationMiddleware, productController.getProductVitaminRules.bind(productController));
router.post('/:id/vitamin-rules', authMiddleware, adminMiddleware, ProductValidators.addToVitaminRule, validationMiddleware, productController.addProductToVitaminRule.bind(productController));
router.delete('/:id/vitamin-rules/:ruleId', authMiddleware, adminMiddleware, ProductValidators.removeFromVitaminRule, validationMiddleware, productController.removeProductFromVitaminRule.bind(productController));

// Роуты для загрузки изображений
router.post('/upload-image', authMiddleware, adminMiddleware, uploadImage, handleMulterError, productController.uploadImage.bind(productController));
router.post('/:id/image', authMiddleware, adminMiddleware, ProductValidators.getById, validationMiddleware, uploadProductImage, handleMulterError, productController.uploadProductImage.bind(productController));
router.delete('/:id/image', authMiddleware, adminMiddleware, ProductValidators.getById, validationMiddleware, productController.deleteProductImage.bind(productController));

export default router;
