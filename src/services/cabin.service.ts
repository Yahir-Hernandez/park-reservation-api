import { Park, Cabin } from '@/types/model';
import { parkModel } from '@/models/park';
import { cabinModel } from "@/models/cabin";
import { reservationModel } from '@/models/reservation';
import { Result } from '@/types/errors';

export class CabinServices {
  static async add(park: Park, cabins: Cabin[]): Promise<Result<string>> {
    if (cabins.length <= 0) {
      return {
        ok: false,
        error: {
          textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
          message: "The information to be added is empty or does not exist",
          status: 422,
        }
      }
    }
    const result: Result<Park> = await parkModel.getById(park.id);
    if (!result.ok) return result;
    const existPark: Park = result.data;
    if (!CabinServices.validateName(cabins)) {
      return {
        ok: false,
        error: {
          textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
          message: "There are booths with the same name",
          status: 422,
        }
      }
    }
    if (!CabinServices.validateID(existPark, cabins)) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: "Some cabins do not belong to the park",
        status: 422,
      }   
    };
    if (!CabinServices.validateCapacity(cabins)) return {
      ok: false,
      error: {
        textCode: 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES',
        message: `Some cabins in the ${existPark.name} park have a capacity less than or equal to zero.`,
        status: 422,
      }
    };
    if (cabins.length === 1) {
      const cabin = cabins[0]!;
      const added = await cabinModel.create(cabin);
      if (!added.ok) return added;
      return { ok: true, data: `One was added: ${cabin.name}` }
    }
    return  cabinModel.createMany(cabins)
  }

  static async remove(cabin: Cabin): Promise<Result<Cabin>> {
    const result = await reservationModel.findByCabin(cabin.id);
    if (!result.ok) return result;
    if (result.data.length > 0) return {
      ok: false,
      error: {
        textCode: 'RESERVATION_ALREADY_EXISTS',
        message: 'Cabins with existing reservations cannot be removed',
        status: 422,
      }
    };
    return cabinModel.delete(cabin.id);
  }

  private static validateName(cabins: Cabin[]): boolean {
    if (cabins.length <= 0) return false;
    if (cabins.length === 1) return true;
    const names: Set<string> = new Set(cabins.map(c => c.name));
    return names.size === cabins.length;
  }

  private static validateID(park: Park, cabins: Cabin[]): boolean {
    const corrects = cabins.filter(c => c.parkId == park.id);
    return cabins.length === corrects.length;
  }

  private static validateCapacity(cabins: Cabin[]): boolean {
    let isCorrect = true;
    cabins.forEach(c => {
      isCorrect = isCorrect && (c.capacity > 0);
    });
    return isCorrect;
  }
}