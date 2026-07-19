import { Reservation, ReserFilter } from '../../types/reservation';
import { readReservationJson, writeReservationJson } from '../../utils/jsonStorage';

export class ModelReservation {

  async getAll(): Promise<Reservation[]> {
    return await readReservationJson();
  }

  async getBy(filter: ReserFilter): Promise<Reservation[]> {
    const reservs = await readReservationJson();
    return reservs.filter((reserv) => {
      const activeFilterKeys = Object.keys(filter).filter(
        key => filter[key as keyof ReserFilter] !== undefined
      );

      return activeFilterKeys.every((key) => {
        const reservValue = reserv[key as keyof Reservation];
        const filterValue = filter[key as keyof ReserFilter];

        if (Array.isArray(reservValue) && Array.isArray(filterValue)) {
          return filterValue.every(item => reservValue.includes(item));
        }

        if (typeof reservValue === 'string' && typeof filterValue === 'string') {
          return reservValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return reservValue === filterValue;
      });
    });
  }

  static async add(reserv: Reservation): Promise<void> {
    const reservations = await readReservationJson();
    reservations.push(reserv);
    await writeReservationJson(reservations);
  }

  static async deleteBy(filter: ReserFilter): Promise<void> {
    const activeFilterKeys = Object.keys(filter).filter(
      key => filter[key as keyof ReserFilter] !== undefined
    );

    await writeReservationJson(
      (await readReservationJson()).filter((reserv) => {
        return !activeFilterKeys.every((key) => {
          const reservValue = reserv[key as keyof Reservation];
          const filterValue = filter[key as keyof ReserFilter];

          if (Array.isArray(reservValue) && Array.isArray(filterValue)) {
            return filterValue.every(item => reservValue.includes(item));
          }

          if (typeof reservValue === 'string' && typeof filterValue === 'string') {
            return reservValue.toLowerCase().includes(filterValue.toLowerCase());
          }

          return reservValue === filterValue;
        });
      })
    );
  }
}