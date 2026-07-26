import { Router } from 'express';
import { ReservationController } from '@/controllers/reservation.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from "@/middlewares/validate.middleware";
import { createReservationSchema } from "@/schemas/reservation.schema";

const router = Router();
// RULE: router.METODO(ruta, [auth?], [authorize?], [validate?], controller);
// Todas las rutas de reservaciones requieren autenticación.
router.use(authenticate);

router.post('/',validate(createReservationSchema), ReservationController.create);
router.get('/me', ReservationController.listMine);
router.get('/', authorize('administrador'), ReservationController.listAll);
router.get('/:id', ReservationController.getById);
router.patch('/:id/cancel', ReservationController.cancel);

export default router;
