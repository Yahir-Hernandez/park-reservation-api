import { CabinModel, Cabin, BaseOmitKeys } from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";
import { Result } from "@/types/errors";

export const baseModel: CabinModel = createModel<
  Cabin,
  number
>(
  prisma.cabin,
  'Cabin',
  'CABIN_NOT_FOUND'
);


export const cabinModel = Object.assign(
  baseModel, {
  async createMany(cabins: Omit<Cabin, BaseOmitKeys>[]): Promise<Result<string>> {
    try {
      const result = await prisma.cabin.createMany({ data: cabins })
      return { ok: true, data: `Se agregaron ${result.count}` };
    } catch {
      return {
        ok: false ,
        error: {
          textCode: 'INTERNAL_ERROR',
          message: 'Server internal error',
          status: 500,
        } 
      };
    }
  }
}
);