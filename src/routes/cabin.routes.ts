import { Router } from 'express';
import { CabinController } from '@/controllers/cabin.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

router.get('/:id', CabinController.getById);
router.delete('/:id', authenticate, authorize('administrador'), CabinController.remove);

export default router;
