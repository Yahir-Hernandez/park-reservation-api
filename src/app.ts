import express, { Application } from 'express';
import cors from 'cors';
import apiRoutes from '@/routes';
import { notFoundHandler } from '@/middlewares/notFound.middleware';
import { errorHandler } from '@/middlewares/errorHandler.middleware';

const app: Application = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — útil para verificar despliegue (Render, etc.)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Rutas de la API
app.use('/api', apiRoutes);

// 404 para rutas no reconocidas
app.use(notFoundHandler);

// Manejador de errores de último recurso
app.use(errorHandler);

export default app;
