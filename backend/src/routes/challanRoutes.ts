import { Router } from 'express';
import { Role } from '@prisma/client';
import * as challanController from '../controllers/challanController';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  challanBodySchema,
  challanQuerySchema,
  challanUpdateSchema,
} from '../validators/challan';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: challanQuerySchema }), challanController.list);
router.get('/:id', validate({ params: idParamSchema }), challanController.getById);
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ body: challanBodySchema }),
  challanController.create,
);
router.patch(
  '/:id',
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ params: idParamSchema, body: challanUpdateSchema }),
  challanController.update,
);
router.post(
  '/:id/confirm',
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ params: idParamSchema }),
  challanController.confirm,
);
router.post(
  '/:id/cancel',
  requireRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validate({ params: idParamSchema }),
  challanController.cancel,
);

export default router;
