import { Router } from 'express';
import { SurveyController } from '../controllers/SurveyController';
import { authMiddleware } from '../middleware/auth';
import { validateDto } from '../middleware/validation';
import { SurveyDto } from '../validators/SurveyValidators';
import { generalRateLimit } from '../middleware/security';

const router = Router();
const surveyController = new SurveyController();

/**
 * @swagger
 * tags:
 *   name: Survey
 *   description: Опросник для персонального подбора витаминов
 */

router.get('/questions', 
  generalRateLimit,
  (req, res) => surveyController.getQuestions(req as any, res)
);

router.post('/', 
  generalRateLimit,
  authMiddleware,
  validateDto(SurveyDto),
  (req, res) => surveyController.saveSurvey(req as any, res)
);

router.get('/', 
  generalRateLimit,
  authMiddleware,
  (req, res) => surveyController.getSurvey(req as any, res)
);

router.get('/recommendations', 
  generalRateLimit,
  authMiddleware,
  (req, res) => surveyController.getRecommendations(req as any, res)
);

export default router;
