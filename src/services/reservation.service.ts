import { Park, Reservation, User } from '@/types/model';
import { reservationModel } from '@/models/reservation';
import { userModel } from '@/models/user';
import { cabinModel } from '@/models/cabin';
import { Result } from '@/types/errors';
import {
  isAfter,
  isBefore,
  eachDayOfInterval,
  getDay
} from 'date-fns';
import { parkModel } from '@/models/park';

const mapDays: Record<string, number> = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
}

export class ReservationService {
  static isOnSeason(park: Park, reservation: Reservation): Result<Reservation> {
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
      const resp3 = ReservationService.isOnSeason(park, res);
      if (!resp3.ok) return resp3;
      const resp4 = await ReservationService.validateVisitType(park, res);
      if (!resp4.ok) return resp4;
      const resp5 = ReservationService.hasClosedDayInRange(res, park);
      if (!resp5.ok) return resp5;
      const resp6 = await ReservationService.overloap(res, park);
      if (!resp6.ok) return resp6;
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

  // Validar que los dias sean en ingles en "park.closeDays"
  static async overloap(res: Reservation, park: Park): Promise<Result<Reservation>> {
    const resp = await reservationModel.findOverlappingCamping(
      park,
      res.startDate,
      res.endDate
    );
    if (!resp.ok) return resp;
    const reservs: Reservation[] = resp.data;
    if (reservs.length === 0) return {ok: true, data: res};
    let numberPeople: number = reservs.reduce((acc, r) => acc + r.people, 0);
    numberPeople = numberPeople + res.people;
    if (numberPeople > park.capacityCamping) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The camping capacity is not sufficient for the number of people in the reserve.',
        status: 500,
      }
    };
    return {ok: true, data: res};
  }

  static hasClosedDayInRange(res: Reservation, park: Park): Result<Reservation> {
    const closeDays: number[] = park.closeDays.map(d => mapDays[d]!);
    const reservedDays = eachDayOfInterval({ start: res.startDate, end: res.endDate });
    const dayRange: Set<number> = new Set(reservedDays.map(day => getDay(day)));
    if (closeDays.some(day => dayRange.has(day))) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The camping capacity is not sufficient for the number of people in the reserve.',
        status: 500,
      }
    };
    return {ok: true, data: res};
  }
}


