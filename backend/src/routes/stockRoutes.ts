import { Router } from 'express';
import { Role } from '@prisma/client';
import * as stockController from '../controllers/stockController';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  stockMovementBodySchema,
  stockMovementQuerySchema,
} from '../validators/stock';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: stockMovementQuerySchema }), stockController.list);
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.WAREHOUSE),
  validate({ body: stockMovementBodySchema }),
  stockController.create,
);

export default router;
