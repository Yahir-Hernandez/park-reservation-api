import { ReservationModel, CreateReservationInput, Reservation, Park } from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";
import { Result } from '@/types/errors';

// Genera una objetos con metodos comunes CRUD a partir de una funcion que expecializa el objeto.
const baseModel: ReservationModel = createModel<
  Reservation,
  number,
  CreateReservationInput
>(
  prisma.reservation,
  'Reservation',
  'RESERVATION_NOT_FOUND'
);

export const reservationModel = Object.assign(
  baseModel, {
  async findWithPark(park: Park): Promise<Result<Reservation[]>> {
    try {
      const found = await prisma.reservation.findMany({ where: { parkId: park.id } });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },
  async findOverlappingCamping(
    park: Park,
    startDate: Date,
    endDate: Date
  ): Promise<Result<Reservation[]>> {
    try {
      const found = await prisma.reservation.findMany({
        where: {
          parkId: park.id,
          visitType: 'camping',
          status: 'activa',
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        }
      });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },

  // Una cabaña reservada siempre es de tipo 'cabaña', por eso no es necesario
  // filtrar por visitType como en findOverlappingCamping.
  async findOverlappingCabin(
    cabinId: number,
    startDate: Date,
    endDate: Date
  ): Promise<Result<Reservation[]>> {
    try {
      const found = await prisma.reservation.findMany({
        where: {
          cabinId,
          status: 'activa',
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        }
      });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },

  async findAllPaginated(
    page: number,
    pageSize: number
  ): Promise<Result<{ data: Reservation[]; total: number; page: number; pageSize: number }>> {
    try {
      const [data, total] = await Promise.all([
        prisma.reservation.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.reservation.count(),
      ]);
      return {
        ok: true,
        data: { data, total, page, pageSize }
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },

  async findByUser(userId: string): Promise<Result<Reservation[]>> {
    try {
      const found = await prisma.reservation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  },

  // Agregado: necesario para poder bloquear el borrado de una cabaña con
  // reservaciones existentes (mismo criterio ya usado en
  // `ParkService.deletePark` vía `findWithPark`).
  async findByCabin(cabinId: number): Promise<Result<Reservation[]>> {
    try {
      const found = await prisma.reservation.findMany({ where: { cabinId } });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        }
      };
    }
  }
});