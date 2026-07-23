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
  }
});