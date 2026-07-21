import { ReservationModel, CreateReservationInput, Reservation, Park } from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";
import { Result } from '@/types/errors';

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
      const found = await  prisma.reservation.findMany({ where: { parkId: park.id } });
      return {
        ok: true,
        data: found
      };
    } catch {
      return {
        ok: false ,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        } 
      };
    }
  }
}
)