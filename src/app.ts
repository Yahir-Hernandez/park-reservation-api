import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — útil para verificar despliegue (Render, etc.)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas de la API (se irán agregando conforme crezca el proyecto)
// app.use('/api/parks', parkRoutes);
// app.use('/api/reservations', reservationRoutes);
// app.use('/api/auth', authRoutes);

export default app;
