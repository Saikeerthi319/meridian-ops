import { Router } from 'express';
import * as authController from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginSchema } from '../validators/auth';

const router = Router();

router.post('/login', validate({ body: loginSchema }), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;
