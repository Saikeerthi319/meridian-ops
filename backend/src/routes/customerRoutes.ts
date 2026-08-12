import { Router } from 'express';
import { Role } from '@prisma/client';
import * as customerController from '../controllers/customerController';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  customerBodySchema,
  customerQuerySchema,
  customerUpdateSchema,
  followUpBodySchema,
} from '../validators/customer';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: customerQuerySchema }), customerController.list);
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  customerController.getById,
);
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ body: customerBodySchema }),
  customerController.create,
);
router.patch(
  '/:id',
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ params: idParamSchema, body: customerUpdateSchema }),
  customerController.update,
);
router.get(
  '/:id/follow-ups',
  validate({ params: idParamSchema }),
  customerController.listFollowUps,
);
router.post(
  '/:id/follow-ups',
  requireRoles(Role.ADMIN, Role.SALES),
  validate({ params: idParamSchema, body: followUpBodySchema }),
  customerController.addFollowUp,
);

export default router;
