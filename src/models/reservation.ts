import { ReservationModel, CreateReservationInput } from "../types/model";
import { prisma } from "../db/config";
import { Reservation } from "../generated/prisma/client";
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
