# Park Reservation API

API REST para un sistema de reservación de parques (camping y cabañas), construida con **Node.js + TypeScript + Express + Prisma 7 + PostgreSQL**, siguiendo una arquitectura por capas:

```
routes → controllers → services → models (contrato Prisma) → DB
```

## Requisitos

- Node.js 20+ (probado con Node 24)
- Docker y Docker Compose (para levantar PostgreSQL localmente), o una instancia de PostgreSQL 16 accesible.

## Instalación y arranque

```bash
# 1. Clonar el repositorio y entrar al directorio
git clone <url-del-repo>
cd park-reservation-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env si necesitas cambiar credenciales, puerto o JWT_SECRET.

# 4. Levantar PostgreSQL con Docker Compose
docker compose up -d

# 5. Generar el cliente de Prisma
npx prisma generate

# 6. Aplicar las migraciones (crea las tablas en la base de datos)
npx prisma migrate dev

# 7. (Opcional) Poblar la base de datos con datos de ejemplo
npx tsx prisma/seed.ts

# 8. Arrancar el servidor en modo desarrollo (hot reload)
npm run dev
```

El servidor quedará escuchando en `http://localhost:3000` (o el puerto configurado en `PORT`). Puedes verificar que está corriendo con:

```bash
curl http://localhost:3000/health
```

### Build de producción

```bash
npm run build
npm start
```

## Variables de entorno

Ver [`.env.example`](./.env.example) para la lista completa y valores de referencia:

| Variable         | Descripción                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`   | Cadena de conexión a PostgreSQL (usada por Prisma).                |
| `PORT`           | Puerto del servidor HTTP (por defecto `3000`).                     |
| `JWT_SECRET`     | Secreto para firmar/verificar los JWT. **Cámbialo en producción.** |
| `JWT_EXPIRES_IN` | Expiración de los tokens emitidos en el login (por defecto `1d`).  |

## Scripts disponibles

| Script          | Descripción                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run dev`   | Arranca el servidor con recarga automática (`ts-node-dev`, `--transpile-only`, **sin chequeo de tipos**). |
| `npm run build` | Compila TypeScript a `dist/` con `tsc` (**sí** chequea tipos).                                            |
| `npm start`     | Corre el build compilado (`dist/server.js`).                                                              |

> ⚠️ `npm run dev` usa `--transpile-only`, por lo que **no** detecta errores de tipos (incluyendo `noUnusedLocals`/`noUnusedParameters`). Antes de dar por buena cualquier entrega, corre `npm run build` (o `npx tsc --noEmit`) para validar el proyecto completo con el compilador.

## Autenticación y roles

1. `POST /api/auth/register` crea un usuario con rol `cliente` (el registro público nunca permite crear administradores).
2. `POST /api/auth/login` devuelve un `token` JWT.
3. Envía el token en las rutas protegidas con el header:
   ```
   Authorization: Bearer <token>
   ```

Roles existentes: `cliente` y `administrador`. Las rutas de administración (crear/editar/eliminar parques y cabañas, listar todas las reservaciones) requieren rol `administrador`.

## Formato de respuesta y manejo de errores

Éxito:

```json
{ "ok": true, "data": { /* ... */ } }
```

Error:

```json
{ "ok": false, "error": { "textCode": "PARK_NOT_FOUND", "message": "Park not found" } }
```

El `status` HTTP de cada error sigue esta tabla, aplicada de forma consistente en todo el proyecto:

| Situación                                                          | Status |
| ------------------------------------------------------------------ | ------ |
| Recurso no encontrado (usuario, parque, cabaña, reservación)       | `404`  |
| Violación de regla de negocio / validación de datos de entrada     | `422`  |
| Credenciales inválidas en login                                    | `422`  |
| Autenticado pero sin permiso para la acción                        | `403`  |
| No autenticado (falta token / token inválido)                      | `401`  |
| Conflicto de unicidad (correo o username ya registrados)           | `409`  |
| Error interno real (excepción no esperada, fallo de conexión a DB) | `500`  |

## Endpoints

### Auth (`/api/auth`) — públicos

| Método | Ruta        | Descripción                          |
| ------ | ----------- | ------------------------------------ |
| POST   | `/register` | Registra un usuario (rol `cliente`). |
| POST   | `/login`    | Inicia sesión y devuelve un JWT.     |

### Usuarios (`/api/users`)

| Método | Ruta  | Auth | Descripción                     |
| ------ | ----- | ---- | ------------------------------- |
| GET    | `/me` | Sí   | Perfil del usuario autenticado. |

### Parques (`/api/parks`)

| Método | Ruta              | Auth          | Descripción                                    |
| ------ | ----------------- | ------------- | ---------------------------------------------- |
| GET    | `/`               | No            | Lista todos los parques.                       |
| GET    | `/:id`            | No            | Obtiene un parque por id.                      |
| GET    | `/:parkId/cabins` | No            | Lista las cabañas de un parque.                |
| POST   | `/`               | administrador | Crea un parque.                                |
| PATCH  | `/:id`            | administrador | Edita campos editables de un parque.           |
| DELETE | `/:id`            | administrador | Elimina un parque (si no tiene reservaciones). |
| POST   | `/:parkId/cabins` | administrador | Agrega una o más cabañas a un parque.          |

### Cabañas (`/api/cabins`)

| Método | Ruta   | Auth          | Descripción                                     |
| ------ | ------ | ------------- | ----------------------------------------------- |
| GET    | `/:id` | No            | Obtiene una cabaña por id.                      |
| DELETE | `/:id` | administrador | Elimina una cabaña (si no tiene reservaciones). |

### Reservaciones (`/api/reservations`) — todas requieren autenticación

| Método | Ruta          | Auth          | Descripción                                                                                                                                                      |
| ------ | ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/`           | cliente/admin | Crea una reservación (camping o cabaña) para el usuario autenticado. Un administrador puede indicar `userId` en el body para reservar en nombre de otro usuario. |
| GET    | `/me`         | cliente/admin | Lista las reservaciones del usuario autenticado.                                                                                                                 |
| GET    | `/`           | administrador | Lista todas las reservaciones, paginadas (`?page=1&pageSize=20`).                                                                                                |
| GET    | `/:id`        | cliente/admin | Obtiene una reservación (un cliente solo puede ver las suyas).                                                                                                   |
| PATCH  | `/:id/cancel` | cliente/admin | Cancela una reservación (un cliente solo puede cancelar las suyas).                                                                                              |

## Reglas de negocio implementadas

- Una reservación debe caer dentro de la temporada del parque (`startSeason`/`endSeason`).
- Una reservación no puede incluir ningún día en el que el parque esté cerrado (`park.closeDays`, soporta nombres de día en español e inglés).
- Camping: la suma de personas de las reservaciones activas que se traslapan en fechas no puede superar `park.capacityCamping`.
- Cabaña: no se admite ningún traslape de fechas sobre la misma cabaña (independientemente del número de personas), y la capacidad de la cabaña debe ser suficiente para el número de personas.
- No se puede eliminar un parque o una cabaña que ya tenga reservaciones asociadas.
- No se puede reducir la capacidad de camping de un parque por debajo de la ocupación ya comprometida por reservaciones activas futuras.
- Un cliente solo puede cancelar o consultar sus propias reservaciones; un administrador puede operar sobre cualquiera.
- Se permite cancelar reservaciones cuya fecha ya pasó. Cancelar una reservación ya cancelada se rechaza explícitamente.
- El correo y el nombre de usuario son únicos en el sistema (409 si ya existen).

## Estructura del proyecto

```
src/
├── app.ts                 # Configuración de Express (middlewares, rutas, 404, error handler)
├── server.ts              # Punto de entrada (arranca el servidor HTTP)
├── config/
│   └── env.ts             # Variables de entorno centralizadas
├── controllers/           # Traducen HTTP <-> llamadas a servicios
├── middlewares/
│   ├── auth.middleware.ts       # authenticate / authorize (JWT)
│   ├── notFound.middleware.ts   # 404 para rutas no reconocidas
│   └── errorHandler.middleware.ts # Red de seguridad para excepciones no capturadas
├── models/                # Contrato Prisma por entidad (CRUD genérico + métodos propios)
├── routes/                # Definición de rutas Express
├── services/               # Reglas de negocio (siempre devuelven Result<T>)
├── types/
│   ├── errors.ts          # ErrorTextCode, ErrorService, Result<T>
│   ├── model.ts           # Tipos derivados de Prisma
│   └── express.d.ts       # Augmentación de Request (req.user)
├── utils/
│   ├── jwt.ts              # sign/verify de JWT
│   ├── http.ts             # sendResult / sendValidationError
│   └── validation.ts       # Validaciones manuales de payloads
└── generated/prisma/       # Cliente Prisma generado (no versionado)
```

***

Cualquier endpoint no cubierto explícitamente en este documento puede inspeccionarse directamente en `src/routes/*.ts`.
