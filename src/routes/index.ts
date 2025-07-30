import { Router } from 'express';
import { healthRoutes } from './health';
import { userRoutes } from './users';
import feedbackRoutes from './feedback';
import surveyRoutes from './survey';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/survey', surveyRoutes);

export { router as routes };
