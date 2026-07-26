import { Park } from '@/types/model';
import { parkModel } from '@/models/park';
import { reservationModel } from '@/models/reservation';
import { isAfter } from 'date-fns';
import { Result } from '@/types/errors';

export type EditableParkFields = {
  location: string;
  services: string[];
  openingTime: Date;
  closingTime: Date;
  latitude: Park['latitude'];
  longitude: Park['longitude'];
  startSeason: Date;
  endSeason: Date;
  closeDays: string[];
  hasCabins: boolean;
  capacityCamping: number;
};

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
  
  static async editPark(parkId: number, changes: Partial<EditableParkFields>): Promise<Result<Park>> {
    const current = await parkModel.getById(parkId);
    if (!current.ok) return current;
    const park = current.data;

    const nextStartSeason = changes.startSeason ?? park.startSeason;
    const nextEndSeason = changes.endSeason ?? park.endSeason;
    if (!isAfter(nextEndSeason, nextStartSeason)) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: `The dates for the ${park.name} park season are incorrect.`,
        status: 422
      }
    };

    if (changes.capacityCamping !== undefined) {
      if (changes.capacityCamping <= 0) return {
        ok: false,
        error: {
          textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
          message: `The park ${park.name} has camping capacity ${changes.capacityCamping} less than or equal to zero`,
          status: 422
        }
      };

      if (changes.capacityCamping < park.capacityCamping) {
        const today = new Date();
        const farFuture = new Date('9999-12-31');
        const overlapping = await reservationModel.findOverlappingCamping(park, today, farFuture);
        if (!overlapping.ok) return overlapping;
        const committed = overlapping.data.reduce((acc, r) => acc + r.people, 0);
        if (changes.capacityCamping < committed) return {
          ok: false,
          error: {
            textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
            message: `Cannot reduce camping capacity to ${changes.capacityCamping}; there are already ${committed} people committed in active camping reservations.`,
            status: 422,
          }
        };
      }
    }

    return parkModel.update(parkId, changes);
  }
}
