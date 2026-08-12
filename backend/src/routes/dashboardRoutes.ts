import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, dashboardController.get);

export default router;
