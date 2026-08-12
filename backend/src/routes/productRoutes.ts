import { Router } from 'express';
import { Role } from '@prisma/client';
import * as productController from '../controllers/productController';
import { requireAuth, requireRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema } from '../validators/common';
import {
  productBodySchema,
  productQuerySchema,
  productUpdateSchema,
} from '../validators/product';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: productQuerySchema }), productController.list);
router.get('/:id', validate({ params: idParamSchema }), productController.getById);
router.post(
  '/',
  requireRoles(Role.ADMIN, Role.WAREHOUSE),
  validate({ body: productBodySchema }),
  productController.create,
);
router.patch(
  '/:id',
  requireRoles(Role.ADMIN, Role.WAREHOUSE),
  validate({ params: idParamSchema, body: productUpdateSchema }),
  productController.update,
);

export default router;
