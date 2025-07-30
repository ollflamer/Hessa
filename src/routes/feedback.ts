import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin, requireAdminOrModerator } from '../middleware/roleAuth';
import { validateDto } from '../middleware/validation';
import { generalRateLimit, authRateLimit } from '../middleware/security';
import { sqlInjectionValidator, requestSizeValidator } from '../middleware/validation';
import { CreateFeedbackDto, FeedbackResponseDto, FeedbackFiltersDto, UpdateFeedbackStatusDto } from '../validators/FeedbackValidators';

const router = Router();
const feedbackController = new FeedbackController();

router.post('/', 
  generalRateLimit,
  requestSizeValidator(10 * 1024),
  sqlInjectionValidator,
  validateDto(CreateFeedbackDto),
  feedbackController.createFeedback
);

router.get('/',
  authMiddleware,
  requireAdminOrModerator,
  sqlInjectionValidator,
  feedbackController.getAllFeedback
);

router.get('/:id',
  generalRateLimit,
  sqlInjectionValidator,
  feedbackController.getFeedbackById
);

router.post('/:id/response',
  authMiddleware,
  requireAdminOrModerator,
  authRateLimit,
  requestSizeValidator(5 * 1024),
  sqlInjectionValidator,
  validateDto(FeedbackResponseDto),
  feedbackController.respondToFeedback
);

router.patch('/:id/status',
  authMiddleware,
  requireAdminOrModerator,
  sqlInjectionValidator,
  validateDto(UpdateFeedbackStatusDto),
  feedbackController.updateFeedbackStatus
);

export default router;
