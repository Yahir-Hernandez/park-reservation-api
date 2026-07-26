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
  // Ingles
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6,
  // Espanol
  'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
  'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6,
}

export class ReservationService {
  static isOnSeason(park: Park, reservation: Reservation): Result<Reservation> {
    if (ReservationService.isOutOfSeason(park, reservation)) return {
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

  private static isOutOfSeason(park: Park, reservation: Reservation): boolean {
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
    return parkModel.getById(res.parkId);
  }

  static async validateUser(res: Reservation): Promise<Result<User>> {
    return userModel.getById(res.userId);
  }

  static async create(res: Reservation): Promise<Result<Reservation>> {
    try {
      const [parkResult, userResult] = await Promise.all([
        ReservationService.validatePark(res),
        ReservationService.validateUser(res),
      ]);
      if (!parkResult.ok) return parkResult;
      if (!userResult.ok) return userResult;
      const park = parkResult.data;

      const seasonResult = ReservationService.isOnSeason(park, res);
      if (!seasonResult.ok) return seasonResult;

      const closedDayResult = ReservationService.hasClosedDayInRange(res, park);
      if (!closedDayResult.ok) return closedDayResult;

      const visitTypeResult = await ReservationService.validateVisitType(park, res);
      if (!visitTypeResult.ok) return visitTypeResult;

      const availabilityResult = await ReservationService.validateAvailability(res, park);
      if (!availabilityResult.ok) return availabilityResult;

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

  static async validateAvailability(res: Reservation, park: Park): Promise<Result<Reservation>> {
    if (res.visitType === 'cabaña') {
      const resp = await reservationModel.findOverlappingCabin(res.cabinId!, res.startDate, res.endDate);
      if (!resp.ok) return resp;
      if (resp.data.length > 0) return {
        ok: false,
        error: {
          textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
          message: 'The cabin is already reserved for the selected date range.',
          status: 422,
        }
      };
      return { ok: true, data: res };
    }

    const resp = await reservationModel.findOverlappingCamping(park, res.startDate, res.endDate);
    if (!resp.ok) return resp;
    const reservs: Reservation[] = resp.data;
    const numberPeople: number = reservs.reduce((acc, r) => acc + r.people, 0) + res.people;
    if (numberPeople > park.capacityCamping) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The camping capacity is not sufficient for the number of people in the reserve.',
        status: 422,
      }
    };
    return { ok: true, data: res };
  }

  static hasClosedDayInRange(res: Reservation, park: Park): Result<Reservation> {
    const closeDays: number[] = park.closeDays
      .map(d => mapDays[d.toLowerCase()])
      .filter((d): d is number => d !== undefined);
    const reservedDays = eachDayOfInterval({ start: res.startDate, end: res.endDate });
    const dayRange: Set<number> = new Set(reservedDays.map(day => getDay(day)));
    if (closeDays.some(day => dayRange.has(day))) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The reservation includes a day when the park is closed.',
        status: 422,
      }
    };
    return { ok: true, data: res };
  }

  static async cancel(
    reservationId: number,
    requestingUserId: string,
    requestingUserRole: 'cliente' | 'administrador'
  ): Promise<Result<Reservation>> {
    const result = await reservationModel.getById(reservationId);
    if (!result.ok) return result;
    const reservation = result.data;

    if (requestingUserRole === 'cliente' && reservation.userId !== requestingUserId) {
      return {
        ok: false,
        error: {
          textCode: 'UNAUTHORIZED',
          message: 'You do not have permission to cancel this reservation.',
          status: 403,
        }
      };
    }

    if (reservation.status === 'cancelada') return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'The reservation is already cancelled.',
        status: 422,
      }
    };

    return reservationModel.update(reservationId, { status: 'cancelada' });
  }

  static async listByUser(userId: string): Promise<Result<Reservation[]>> {
    return reservationModel.findByUser(userId);
  }

  static async listAllPaginated(
    page: number,
    pageSize: number
  ): Promise<Result<{ data: Reservation[]; total: number; page: number; pageSize: number }>> {
    if (page < 1 || pageSize < 1 || pageSize > 100) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: 'page must be >= 1 and pageSize must be between 1 and 100.',
        status: 422,
      }
    };
    return reservationModel.findAllPaginated(page, pageSize);
  }
}
