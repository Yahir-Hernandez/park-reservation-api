import { Reservation, ReserFilter } from '../../types/reservation';
import { readReservationJson, writeReservationJson } from '../../utils/jsonStorage';
import { ErrorService } from '../../types/errors';

export class ModelReservation {

  // Helper privado para centralizar la lógica de filtrado y no repetir código
  private static matchesFilter(reserv: Reservation, filter: ReserFilter): boolean {
    const activeFilterKeys = Object.keys(filter).filter(
      key => filter[key as keyof ReserFilter] !== undefined
    ) as (keyof ReserFilter)[];

    return activeFilterKeys.every((key) => {
      const reservValue = reserv[key as keyof Reservation];
      const filterValue = filter[key];

      if (Array.isArray(reservValue) && Array.isArray(filterValue)) {
        return filterValue.every(item => reservValue.includes(item));
      }

      if (typeof reservValue === 'string' && typeof filterValue === 'string') {
        return reservValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      return reservValue === filterValue;
    });
  }

  async getAll(): Promise<Reservation[] | ErrorService> {
    return await readReservationJson();
  }

  async getBy(filter: ReserFilter): Promise<Reservation[] | ErrorService> {
    const read = await readReservationJson();
    if (read && 'textCode' in read) return read;

    return read.filter(reserv => ModelReservation.matchesFilter(reserv, filter));
  }

  static async add(reserv: Reservation): Promise<Reservation[] | ErrorService> {
    const read = await readReservationJson();
    if (read && 'textCode' in read) return read;

    read.push(reserv);
    return await writeReservationJson(read);
  }

  static async deleteBy(filter: ReserFilter): Promise<Reservation[] | ErrorService> {
    const read = await readReservationJson();
    if (read && 'textCode' in read) return read;
    const updatedReservations = read.filter(
      reserv => !ModelReservation.matchesFilter(reserv, filter)
    );

    return await writeReservationJson(updatedReservations);
  }
}