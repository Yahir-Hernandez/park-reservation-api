/**
 * Utilidades mínimas de validación de payloads HTTP. El proyecto no incluye
 * ninguna librería de validación (zod, joi, etc.) en sus dependencias
 * actuales, así que se opta por validaciones manuales explícitas en los
 * controladores, apoyadas en estos helpers, en vez de añadir una nueva
 * dependencia no solicitada.
 */

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string');
}

export function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function missingFields(body: Record<string, unknown>, fields: string[]): string[] {
  return fields.filter(field => body[field] === undefined || body[field] === null || body[field] === '');
}

/**
 * Parsea un parámetro de ruta (`req.params.x`) como entero.
 *
 * Express 5 tipa `req.params[key]` como `string | string[]` (para soportar
 * rutas con wildcards que capturan varios segmentos), aunque en las rutas de
 * este proyecto (`/:id`, `/:parkId`, etc.) siempre será un único `string` en
 * tiempo de ejecución. Se maneja el caso `string[]` de forma defensiva.
 */
export function parseIntParam(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) return null;
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}
