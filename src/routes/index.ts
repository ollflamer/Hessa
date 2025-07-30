import { Router } from 'express';
import { healthRoutes } from './health';
import { userRoutes } from './users';
import feedbackRoutes from './feedback';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/feedback', feedbackRoutes);

export { router as routes };
