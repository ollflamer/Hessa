import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middleware/auth';
import { validateRequired, validateEmail } from '../validators';

const router = Router();
const userController = new UserController();

router.post('/register', 
  validateRequired(['email', 'name', 'password']),
  validateEmail,
  userController.register
);

router.post('/login',
  validateRequired(['email', 'password']),
  validateEmail,
  userController.login
);

router.get('/profile', authMiddleware, userController.getProfile);
router.get('/all', authMiddleware, userController.getAllUsers);

export { router as userRoutes };
