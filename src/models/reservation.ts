import { ReservationModel, CreateReservationInput , Reservation} from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";

export const reservationModel: ReservationModel= createModel<
  Reservation, 
  number, 
  CreateReservationInput
>(
  prisma.reservation,
  'Reservation',
  'RESERVATION_NOT_FOUND'
);