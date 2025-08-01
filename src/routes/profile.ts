import { Router, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { ProfileController } from '../controllers/ProfileController';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { ProfileValidators } from '../validators/ProfileValidators';

const router = Router();
const profileController = new ProfileController();

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения JPEG, PNG, WebP'));
    }
  }
});

router.use(authMiddleware);

router.get('/', profileController.getProfile.bind(profileController));

router.get('/extended', profileController.getExtendedProfile.bind(profileController));

router.put(
  '/', 
  ProfileValidators.updateProfile, 
  validationMiddleware, 
  profileController.updateProfile.bind(profileController)
);

router.get('/options', profileController.getProfileOptions.bind(profileController));

router.post(
  '/avatar',
  upload.single('avatar'),
  ProfileValidators.uploadAvatar,
  validationMiddleware,
  profileController.uploadAvatar.bind(profileController)
);

router.delete('/avatar', profileController.deleteAvatar.bind(profileController));

export default router;
