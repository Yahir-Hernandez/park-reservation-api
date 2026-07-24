import { Router } from 'express';
import { ParkController } from '@/controllers/park.controller';
import { CabinController } from '@/controllers/cabin.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

// Lectura pública: cualquiera puede consultar parques y sus cabañas.
router.get('/', ParkController.list);
router.get('/:id', ParkController.getById);
router.get('/:parkId/cabins', CabinController.listByPark);

// Escritura: solo administradores.
router.post('/', authenticate, authorize('administrador'), ParkController.create);
router.patch('/:id', authenticate, authorize('administrador'), ParkController.update);
router.delete('/:id', authenticate, authorize('administrador'), ParkController.remove);
router.post('/:parkId/cabins', authenticate, authorize('administrador'), CabinController.create);

export default router;
