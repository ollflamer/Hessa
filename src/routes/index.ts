import { Router } from 'express';
import { healthRoutes } from './health';
import { userRoutes } from './users';
import feedbackRoutes from './feedback';
import surveyRoutes from './survey';
import productsRoutes from './products';
import categoriesRoutes from './categories';
import profileRoutes from './profile';
import ordersRoutes from './orders';
import referralRoutes from './referrals';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/survey', surveyRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/profile', profileRoutes);
router.use('/orders', ordersRoutes);
router.use('/referrals', referralRoutes);

export { router as routes };
