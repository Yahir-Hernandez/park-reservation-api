import { Result } from '@/types/errors';
import { Park, Cabin, Reservation, User } from "@/generated/prisma/client";
export { Park, Cabin, Reservation, User};

// Tipamos de forma genérica qué campos se omiten por defecto al crear CUALQUIER modelo de tu DB
export type BaseOmitKeys = 'id' | 'createdAt' | 'updatedAt';

export interface Model<T, ID, CreateInput = Omit<T, BaseOmitKeys>> {
  getAll(): Promise<Result<T[]>>;
  getById(id: ID): Promise<Result<T>>;
  
  // Usamos un tipo específico de creación para mayor flexibilidad
  create(data: CreateInput): Promise<Result<T>>;
  
  // Para actualizar, hacemos que los datos de creación sean opcionales, 
  // garantizando que no puedan modificar IDs ni fechas de auditoría
  update(id: ID, data: Partial<CreateInput>): Promise<Result<T>>;
  
  delete(id: ID): Promise<Result<T>>;
}

// 1. PARK: ID numérico. Omitimos valores con @default en la DB si queremos que sean opcionales al crear.
export type CreateParkInput = Omit<Park, BaseOmitKeys> & {
  hasCabins?: boolean;       // Opcional porque tiene @default(false)
  capacityCamping?: number;  // Opcional porque tiene @default(0)
};
export type ParkModel = Model<Park, number, CreateParkInput>;


// 2. CABIN: ID numérico. Bastante directo.
export type CabinModel = Model<Cabin, number>;


// 3. RESERVATION: ID numérico. 'cabinId' ya viene como 'number | null' desde Prisma, 
// y 'status' puede ser opcional al crear por su valor por defecto.
export type CreateReservationInput = Omit<Reservation, BaseOmitKeys> & {
  status?: Reservation['status']; // Opcional porque tiene @default(activa)
};
export type ReservationModel = Model<Reservation, number, CreateReservationInput>;


// 4. USER: ID es un String (UUID). Omitimos 'passwordHash' si en tu DTO de creación 
// recibes 'password' plano para luego encriptarlo, o lo dejas si lo manejas directo.
export type CreateUserInput = Omit<User, BaseOmitKeys> & {
  role?: User['role']; // Opcional porque tiene @default(cliente)
};
export type UserModel = Model<User, string, CreateUserInput>;

