import { Router } from 'express';
import { ParkController } from '@/controllers/park.controller';
import { CabinController } from '@/controllers/cabin.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { createCabinsSchema } from '@/schemas/cabin.chemas';
import {
  createParkSchema,
  updateParkSchema
} from '@/schemas/park.schema'

const router = Router();

// Lectura pública: cualquiera puede consultar parques y sus cabañas.
router.get('/', ParkController.list);
router.get('/:id', ParkController.getById);
router.get('/:parkId/cabins', CabinController.listByPark);

// Escritura: solo administradores.
router.post('/', authenticate, authorize('administrador'), validate(createParkSchema), ParkController.create);
router.patch('/:id', authenticate, authorize('administrador'), validate(updateParkSchema), ParkController.update);
router.delete('/:id', authenticate, authorize('administrador'), ParkController.remove);
router.post('/:parkId/cabins', authenticate, authorize('administrador'), validate(createCabinsSchema), CabinController.create);

export default router;
