import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  // NOTA: se define un valor por defecto solo para no romper `npm run dev` en
  // un checkout nuevo sin `.env`, pero en producción SIEMPRE debe definirse
  // JWT_SECRET explícitamente (ver README.md).
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
};
