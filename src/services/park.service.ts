import { Park } from '@/types/model';
import { parkModel } from '@/models/park';
import { cabinModel } from "@/models/cabin";
import { isAfter } from 'date-fns';
import { Result } from '@/types/errors';

export class ParkService {
  static async validateSeason(park: Park): Promise<Result<Park>> {
    if (isAfter(park.endSeason, park.startSeason)) return {
      ok: false,
      error: {
        textCode: 'END_SEASON_MUST_BE_AFTER_START_SEASON',
        message: `The dates for the ${park.name} park season are incorrect.`,
        status: 422
      }
    };
    return {ok: true, data: park}
  }

  static async correctCapacity(park: Park): Promise<Result<Park>> {
    if (park.capacityCamping > 0 ) return {ok: true, data: park};
    return {
      ok: false,
      error: {
        textCode: 'THE_CAMPING_CAPACITY_MUST_BE_GREATER_THAN_ZERO',
        message: `The park ${park.name} has camping capacity ${park.capacityCamping} less than or equal to zero`,
        status: 422
      }
    };
  }
}