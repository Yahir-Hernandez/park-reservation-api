import { Park } from '@/types/model';
import { parkModel } from '@/models/park';
import { reservationModel } from '@/models/reservation';
import { isAfter } from 'date-fns';
import { Result } from '@/types/errors';

export class ParkService {
  static async createPark(park: Park): Promise<Result<Park>> {
    if (!isAfter(park.endSeason, park.startSeason)) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: `The dates for the ${park.name} park season are incorrect.`,
        status: 422
      }
    };
    if (park.capacityCamping <= 0) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: `The park ${park.name} has camping capacity ${park.capacityCamping} less than or equal to zero`,
        status: 422
      }
    };
    return parkModel.create(park);
  }

  static async deletePark(park: Park): Promise<Result<Park>> {
    const result = await reservationModel.findWithPark(park);
    if (!result.ok) return result;
    if (!(result.data.length === 0)) return {
      ok: false,
      error: {
        textCode: 'RESERVATION_ALREADY_EXISTS',
        message: 'Parks with existing reservations cannot be removed',
        status: 422,
      }
    };
    return parkModel.delete(park.id);
  }
}