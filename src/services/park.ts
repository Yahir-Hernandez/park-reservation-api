import { ModelPark } from '../models/local/park';
import { Park, ParkFilter } from '../types/park';
import { Result, ErrorService } from '../types/errors';
import { format, isBefore } from 'date-fns';

export class ParkServices {
  static async parks(): Result<Park[]> {
    const result = await ModelPark.getAll();
    if (result && 'textCode' in result) {
      return [null, result];
    }
    return [result, null];
  }

  static async park(filter: ParkFilter): Result<Park[]> {
    const result = await ModelPark.getBy(filter);
    if (result && 'textCode' in result) {
      return [null, result];
    }
    return [result, null];
  }

  static async create(park: Park): Result<Park[]> {
    const [validPark, error] = this.validate(park);
    if (error !== null) return [null, error];
    const result = await ModelPark.add(validPark as Park);
    if (result && 'textCode' in result) return [null, result];
    return [result, null];
  }

  static validate(park: Park): [Park | null , ErrorService | null] {
    const startSeason = format(park.start_season, 'yyyy-MM-dd');
    const endSeason = format(park.end_season, 'yyyy-MM-dd');
    if (!isBefore(endSeason, startSeason)) {
      return [null, {
        textCode: 'END_SEASON_MUST_BE_AFTER_START_SEASON',
        message: 'End season must be after start season',
      }];
    }
    if (park.capacity_camping <= 0) {
      return [null, {
        textCode: 'CAPACITY_CAMPING_MUST_BE_POSITIVE',
        message: 'Capacity camping must be positive',
      }];
    }
    if (park.capacity_cabinets !== undefined
      && park.capacity_cabinets <= 0) {
      return [null, {
        textCode: 'CAPACITY_CABINETS_MUST_BE_POSITIVE',
        message: 'Capacity cabinets must be positive',
      }];
    }
    return [park, null];
  }

}
