import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { registerRateLimit, authRateLimit } from '../middleware/security';
import { validateDto, sqlInjectionValidator, requestSizeValidator } from '../middleware/validation';
import { bruteForceMiddleware } from '../middleware/bruteForce';
import { RegisterUserDto, LoginUserDto } from '../validators/UserValidators';

const router = Router();
const userController = new UserController();

router.post('/register', 
  registerRateLimit,
  requestSizeValidator(10 * 1024),
  sqlInjectionValidator,
  validateDto(RegisterUserDto),
  userController.register
);

router.post('/login',
  authRateLimit,
  requestSizeValidator(5 * 1024),
  sqlInjectionValidator,
  bruteForceMiddleware,
  validateDto(LoginUserDto),
  userController.login
);

router.get('/profile', 
  sqlInjectionValidator,
  authMiddleware, 
  userController.getProfile
);

router.get('/all', 
  sqlInjectionValidator,
  authMiddleware, 
  userController.getAllUsers
);

export { router as userRoutes };
