import { CabinModel, Cabin } from "@/types/model";
import { prisma } from "@/db/config";
import { createModel } from "./generic";

export const cabinModel: CabinModel = createModel<
  Cabin,
  number
>(
  prisma.cabin,
  'Cabin',
  'CABIN_NOT_FOUND'
);

/*
export const cabinModel = Object.assign(
  baseModel, {
    getByPark: async (id: number) => {
      return await prisma.cabin.findMany({ where: { parkId: id} })
    }
  }
);*/