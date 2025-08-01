import { Router } from 'express';
import { ReferralController } from '../controllers/ReferralController';
import { ReferralService } from '../services/ReferralService';
import { DatabaseService } from '../services/DatabaseService';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { validationMiddleware } from '../middleware/validation';
import {
  spendPointsValidator,
  getReferralsValidator,
  getPointsHistoryValidator,
  getReferralByCodeValidator,
  adminSpendPointsValidator,
  adminAwardPointsValidator
} from '../validators/ReferralValidators';

const router = Router();
const dbService = new DatabaseService();
const referralService = new ReferralService(dbService);
const referralController = new ReferralController(referralService);

router.get('/link', 
  authMiddleware, 
  referralController.getReferralLink.bind(referralController)
);

router.get('/info', 
  authMiddleware, 
  referralController.getReferralInfo.bind(referralController)
);

router.get('/my', 
  authMiddleware,
  getReferralsValidator,
  validationMiddleware,
  referralController.getMyReferrals.bind(referralController)
);

router.get('/points/history', 
  authMiddleware,
  getPointsHistoryValidator,
  validationMiddleware,
  referralController.getPointsHistory.bind(referralController)
);

router.post('/points/spend', 
  authMiddleware,
  spendPointsValidator,
  validationMiddleware,
  referralController.spendPoints.bind(referralController)
);

router.get('/stats', 
  authMiddleware,
  referralController.getMyStats.bind(referralController)
);

router.get('/code/:code', 
  getReferralByCodeValidator,
  validationMiddleware,
  referralController.getReferralByCode.bind(referralController)
);

router.get('/admin/stats', 
  authMiddleware,
  adminMiddleware,
  referralController.getAdminStats.bind(referralController)
);

router.post('/admin/users/:userId/points/award', 
  authMiddleware,
  adminMiddleware,
  adminAwardPointsValidator,
  validationMiddleware,
  referralController.adminAwardPoints.bind(referralController)
);

router.post('/admin/users/:userId/points/spend', 
  authMiddleware,
  adminMiddleware,
  adminSpendPointsValidator,
  validationMiddleware,
  referralController.adminSpendPoints.bind(referralController)
);

export default router;
