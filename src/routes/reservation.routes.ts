import { Router } from 'express';
import { ReservationController } from '@/controllers/reservation.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

// Todas las rutas de reservaciones requieren autenticación.
router.use(authenticate);

router.post('/', ReservationController.create);
router.get('/me', ReservationController.listMine);
router.get('/', authorize('administrador'), ReservationController.listAll);
router.get('/:id', ReservationController.getById);
router.patch('/:id/cancel', ReservationController.cancel);

export default router;
