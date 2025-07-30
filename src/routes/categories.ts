import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/adminAuth';
import { validationMiddleware } from '../middleware/validation';
import { ProductValidators } from '../validators/ProductValidators';

const router = Router();
const categoryController = new CategoryController();

// Публичные роуты (чтение)
router.get('/with-counts', categoryController.getCategoriesWithCounts.bind(categoryController));
router.get('/:id', ProductValidators.getById, validationMiddleware, categoryController.getCategoryById.bind(categoryController));
router.get('/', categoryController.getAllCategories.bind(categoryController));

// Защищенные роуты (только для администраторов)
router.post('/', authMiddleware, adminMiddleware, ProductValidators.createCategory, validationMiddleware, categoryController.createCategory.bind(categoryController));
router.put('/:id', authMiddleware, adminMiddleware, ProductValidators.getById, ProductValidators.updateCategory, validationMiddleware, categoryController.updateCategory.bind(categoryController));
router.delete('/:id', authMiddleware, adminMiddleware, ProductValidators.getById, validationMiddleware, categoryController.deleteCategory.bind(categoryController));

export default router;
