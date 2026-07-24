# Park Reservation API

🇪🇸🇲🇽: [Leer en Español](docs/README.es.md)

REST API for a park reservation system (camping and cabins), built with **Node.js + TypeScript + Express + Prisma 7 + PostgreSQL**, following a layered architecture:

```
routes → controllers → services → models (Prisma contract) → DB
```

## Requirements

- Node.js 20+ (tested with Node 24)
- Docker and Docker Compose (to run PostgreSQL locally), or an accessible PostgreSQL 16 instance.

## Installation and setup

```bash
# 1. Clone the repository and enter the directory
git clone <repo-url>
cd park-reservation-api

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env if you need to change credentials, port, or JWT_SECRET.

# 4. Start PostgreSQL with Docker Compose
docker compose up -d

# 5. Generate the Prisma client
npx prisma generate

# 6. Apply migrations (creates the tables in the database)
npx prisma migrate dev

# 7. (Optional) Seed the database with sample data
npx tsx prisma/seed.ts

# 8. Start the server in development mode (hot reload)
npm run dev
```

The server will listen on `http://localhost:3000` (or the port configured in `PORT`). You can verify it's running with:

```bash
curl http://localhost:3000/health
```

### Production build

```bash
npm run build
npm start
```

## Environment variables

See [`.env.example`](./.env.example) for the full list and reference values:

| Variable         | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string (used by Prisma).                 |
| `PORT`           | HTTP server port (defaults to `3000`).                         |
| `JWT_SECRET`     | Secret used to sign/verify JWTs. **Change it in production.**  |
| `JWT_EXPIRES_IN` | Expiration time for tokens issued on login (defaults to `1d`). |

## Available scripts

| Script          | Description                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| `npm run dev`   | Starts the server with auto-reload (`ts-node-dev`, `--transpile-only`, **no type checking**). |
| `npm run build` | Compiles TypeScript to `dist/` with `tsc` (**does** type-check).                              |
| `npm start`     | Runs the compiled build (`dist/server.js`).                                                   |

> ⚠️ `npm run dev` uses `--transpile-only`, so it **does not** catch type errors (including `noUnusedLocals`/`noUnusedParameters`). Before considering any work done, run `npm run build` (or `npx tsc --noEmit`) to validate the whole project with the compiler.

## Authentication and roles

1. `POST /api/auth/register` creates a user with the `cliente` role (public registration never allows creating administrators).
2. `POST /api/auth/login` returns a JWT `token`.
3. Send the token on protected routes with the header:
   ```
   Authorization: Bearer <token>
   ```

Existing roles: `cliente` and `administrador`. Admin routes (create/edit/delete parks and cabins, list all reservations) require the `administrador` role.

## Response format and error handling

Success:

```json
{ "ok": true, "data": { /* ... */ } }
```

Error:

```json
{ "ok": false, "error": { "textCode": "PARK_NOT_FOUND", "message": "Park not found" } }
```

The HTTP `status` for each error follows this table, applied consistently throughout the project:

| Situation                                                         | Status |
| ----------------------------------------------------------------- | ------ |
| Resource not found (user, park, cabin, reservation)               | `404`  |
| Business rule violation / input data validation                   | `422`  |
| Invalid credentials on login                                      | `422`  |
| Authenticated but not authorized for the action                   | `403`  |
| Not authenticated (missing/invalid token)                         | `401`  |
| Uniqueness conflict (email or username already registered)        | `409`  |
| Real internal error (unexpected exception, DB connection failure) | `500`  |

## Endpoints

### Auth (`/api/auth`) — public

| Method | Route       | Description                        |
| ------ | ----------- | ---------------------------------- |
| POST   | `/register` | Registers a user (role `cliente`). |
| POST   | `/login`    | Logs in and returns a JWT.         |

### Users (`/api/users`)

| Method | Route | Auth | Description                   |
| ------ | ----- | ---- | ----------------------------- |
| GET    | `/me` | Yes  | Authenticated user's profile. |

### Parks (`/api/parks`)

| Method | Route             | Auth          | Description                                 |
| ------ | ----------------- | ------------- | ------------------------------------------- |
| GET    | `/`               | No            | Lists all parks.                            |
| GET    | `/:id`            | No            | Gets a park by id.                          |
| GET    | `/:parkId/cabins` | No            | Lists a park's cabins.                      |
| POST   | `/`               | administrador | Creates a park.                             |
| PATCH  | `/:id`            | administrador | Edits editable fields of a park.            |
| DELETE | `/:id`            | administrador | Deletes a park (if it has no reservations). |
| POST   | `/:parkId/cabins` | administrador | Adds one or more cabins to a park.          |

### Cabins (`/api/cabins`)

| Method | Route  | Auth          | Description                                  |
| ------ | ------ | ------------- | -------------------------------------------- |
| GET    | `/:id` | No            | Gets a cabin by id.                          |
| DELETE | `/:id` | administrador | Deletes a cabin (if it has no reservations). |

### Reservations (`/api/reservations`) — all require authentication

| Method | Route         | Auth          | Description                                                                                                                                      |
| ------ | ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/`           | cliente/admin | Creates a reservation (camping or cabin) for the authenticated user. An admin can specify `userId` in the body to book on another user's behalf. |
| GET    | `/me`         | cliente/admin | Lists the authenticated user's reservations.                                                                                                     |
| GET    | `/`           | administrador | Lists all reservations, paginated (`?page=1&pageSize=20`).                                                                                       |
| GET    | `/:id`        | cliente/admin | Gets a reservation (a client can only view their own).                                                                                           |
| PATCH  | `/:id/cancel` | cliente/admin | Cancels a reservation (a client can only cancel their own).                                                                                      |

## Implemented business rules

- A reservation must fall within the park's season (`startSeason`/`endSeason`).
- A reservation cannot include any day the park is closed (`park.closeDays`, supports day names in Spanish and English).
- Camping: the sum of people from active reservations that overlap in dates cannot exceed `park.capacityCamping`.
- Cabin: no date overlap is allowed on the same cabin (regardless of number of people), and the cabin's capacity must be sufficient for the number of people.
- A park or cabin that already has associated reservations cannot be deleted.
- A park's camping capacity cannot be reduced below the occupancy already committed by future active reservations.
- A client can only cancel or view their own reservations; an administrator can operate on any of them.
- Canceling reservations whose date has already passed is allowed. Canceling an already-canceled reservation is explicitly rejected.
- Email and username are unique in the system (409 if they already exist).

## Project structure

```
src/
├── app.ts                 # Express configuration (middlewares, routes, 404, error handler)
├── server.ts              # Entry point (starts the HTTP server)
├── config/
│   └── env.ts             # Centralized environment variables
├── controllers/           # Translate HTTP <-> service calls
├── middlewares/
│   ├── auth.middleware.ts       # authenticate / authorize (JWT)
│   ├── notFound.middleware.ts   # 404 for unrecognized routes
│   └── errorHandler.middleware.ts # Safety net for uncaught exceptions
├── models/                # Prisma contract per entity (generic CRUD + custom methods)
├── routes/                # Express route definitions
├── services/               # Business rules (always return Result<T>)
├── types/
│   ├── errors.ts          # ErrorTextCode, ErrorService, Result<T>
│   ├── model.ts           # Types derived from Prisma
│   └── express.d.ts       # Request augmentation (req.user)
├── utils/
│   ├── jwt.ts              # JWT sign/verify
│   ├── http.ts             # sendResult / sendValidationError
│   └── validation.ts       # Manual payload validations
└── generated/prisma/       # Generated Prisma client (not versioned)
```

***

Any endpoint not explicitly covered in this document can be inspected directly in `src/routes/*.ts`.
