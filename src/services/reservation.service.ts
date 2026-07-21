import { Park, Cabin, Reservation, User } from '@/types/model';
import { reservationModel } from '@/models/reservation';
import { userModel } from '@/models/user';
import { cabinModel } from '@/models/cabin';
import { Result } from '@/types/errors';
import { isAfter, isBefore } from 'date-fns';
import { parkModel } from '@/models/park';
import { error } from 'node:console';
import { promises } from 'node:dns';

export class ReservationService {
  static  isOnSeason(park: Park, reservation: Reservation): Result<Reservation> {
    if (ReservationService.validateDate(park, reservation)) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: `The dates for the ${park.name} park season are incorrect.`,
        status: 422
      }
    };
    return {
      ok: true,
      data: reservation
    }
  }

  private static validateDate(park: Park, reservation: Reservation): boolean {
    const initDate = reservation.startDate;
    const endDate = reservation.endDate;
    return isAfter(park.startSeason, initDate) || isBefore(park.endSeason, endDate);
  }


  static async validateVisitType(park: Park, reservation: Reservation): Promise<Result<Reservation>> {
    const people = reservation.people;
    const typeVisit = reservation.visitType;
    if (typeVisit === "cabaña") {
      if (!reservation.cabinId) return {
        ok: false,
        error: {
          textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
          message: `The reservation type is for a cabin, but the cabin ID is not defined. `,
          status: 422,
        }
      };
      const result = await cabinModel.getById(reservation.cabinId);
      if (!result.ok) return result;
      const cabin = result.data;
      if (cabin.capacity < people) return {
        ok: false,
        error: {
          textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
          message: `The cabin ${cabin.name} have capacity (${cabin.capacity}) less than ${people}`,
          status: 422,
        }
      };
      return { ok: true, data: reservation }
    }
    if (park.capacityCamping < people) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: `The park ${park.name} have capacity camping (${park.capacityCamping}) less than ${people}`,
        status: 422,
      }
    };
    return { ok: true, data: reservation };
  }

  static async validatePark(res: Reservation): Promise<Result<Park>> {
    const rest = await parkModel.getById(res.parkId);
    if (!rest.ok) return rest;
    const park = rest.data;
    if (!park) return {
      ok: false,
      error: {
        textCode: 'PARK_NOT_FOUND',
        message: 'There is no park with the identification indicated in the reserve.',
        status: 422,
      }
    };
    return { ok: true, data: park }
  }

  static async validateUser(res: Reservation): Promise<Result<User>> {
    const rest = await userModel.getById(res.userId);
    if (!rest.ok) return rest;
    const user = rest.data;
    if (!user) return {
      ok: false,
      error: {
        textCode: 'USER_NOT_FOUND',
        message: 'There is no user with the identification indicated in the reserve.',
        status: 422,
      }
    };
    return { ok: true, data: user }
  }

  static async create(res: Reservation): Promise<Result<Reservation>> {
    try {
      const prosm1 = ReservationService.validatePark(res);
      const prosm2 = ReservationService.validateUser(res);
      const [resp1, resp2] = await Promise.all([prosm1, prosm2]);
      if (!resp1.ok) return resp1;
      if (!resp2.ok) return resp2;
      const park = resp1.data;
      const resp3 = await ReservationService.validateVisitType(park,res);
      if(!resp3.ok)return resp3;
      const resp4 = ReservationService.isOnSeason(park, res);
      if(!resp4.ok)return resp4;
      return reservationModel.create(res);
    } catch {
      return {
        ok: false,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Error accessing database',
          status: 500,
        }
      };
    }
  }
}


