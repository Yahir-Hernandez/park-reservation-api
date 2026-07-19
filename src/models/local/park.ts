import { Park, ParkFilter } from '../../types/park';
import { readParksJson, writeParksJson } from '../../utils/jsonStorage';
import { ErrorService } from '../../types/errors';

export class ModelPark {

  private static matchesFilter(park: Park, filter: ParkFilter): boolean {
    const activeFilterKeys = Object.keys(filter).filter(
      key => filter[key as keyof ParkFilter] !== undefined
    ) as (keyof ParkFilter)[];

    return activeFilterKeys.every((key) => {
      const parkValue = park[key as keyof Park];
      const filterValue = filter[key];

      if (Array.isArray(parkValue) && Array.isArray(filterValue)) {
        // Regla especial para los días de cierre
        if (key === 'close_days') {
          return filterValue.some(item => parkValue.includes(item));
        }
        return filterValue.every(item => parkValue.includes(item));
      }

      if (typeof parkValue === 'string' && typeof filterValue === 'string') {
        return parkValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      return parkValue === filterValue;
    });
  }

  static async getAll(): Promise<Park[] | ErrorService> {
    return await readParksJson();
  }

  static async getBy(filter: ParkFilter): Promise<Park[] | ErrorService> {
    const read = await readParksJson();
    if (read && 'textCode' in read) return read;

    return read.filter(park => ModelPark.matchesFilter(park, filter));
  }

  static async add(park: Park): Promise<Park[] | ErrorService> {
    const read = await readParksJson();
    if (read && 'textCode' in read) return read;

    read.push(park);
    return await writeParksJson(read);
  }

  static async deleteBy(filter: ParkFilter): Promise<Park[] | ErrorService> {
    const read = await readParksJson();
    if (read && 'textCode' in read) return read;

    
    const updatedParks = read.filter(park => !ModelPark.matchesFilter(park, filter));

    return await writeParksJson(updatedParks);
  }
}