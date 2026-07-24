import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import parkRoutes from './park.routes';
import cabinRoutes from './cabin.routes';
import reservationRoutes from './reservation.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/parks', parkRoutes);
router.use('/cabins', cabinRoutes);
router.use('/reservations', reservationRoutes);

export default router;
