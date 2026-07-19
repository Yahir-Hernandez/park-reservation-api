import { Park, ParkFilter } from '../../types/park';
import { readParksJson, writeParksJson } from '../../utils/jsonStorage';


export class ModelPark {

  static async getAll(): Promise<Park[]> {
    return readParksJson();
  }

  static async getBy(filter: ParkFilter): Promise<Park[]> {
    const parks = await readParksJson()
    return parks.filter((p) => {
      // Obtenemos solo las llaves del filtro que realmente tienen un valor asignado
      const activeFilterKeys = Object.keys(filter).filter(
        key => filter[key as keyof ParkFilter] !== undefined
      );

      return activeFilterKeys.every((key) => {
        const parkValue = p[key as keyof Park];
        const filterValue = filter[key as keyof ParkFilter];

        if (Array.isArray(parkValue) && Array.isArray(filterValue)) {
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
    });
  }

  static async add(park: Park): Promise<void> {
    const parks = await readParksJson();
    parks.push(park);
    await writeParksJson(parks);
  }

  static async deleteBy(filter: ParkFilter): Promise<void> {
    const activeFilterKeys = Object.keys(filter).filter(
      key => filter[key as keyof ParkFilter] !== undefined
    );

    await writeParksJson(
      (await readParksJson()).filter((p) => {
        // Conservamos el parque si NO cumple con TODO el filtro de eliminación
        return !activeFilterKeys.every((key) => {
          const parkValue = p[key as keyof Park];
          const filterValue = filter[key as keyof ParkFilter];

          if (Array.isArray(parkValue) && Array.isArray(filterValue)) {
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
      })
    );
  }
}

