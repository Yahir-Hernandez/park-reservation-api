import { CabinModel } from "../types/model";
import { prisma } from "../db/config";
import { Cabin } from "../generated/prisma/client";
import { createModel } from "./generic";

export const cabinModel: CabinModel = createModel<
  Cabin,
  number
>(
  prisma.cabin,
  'Cabin',
  'CABIN_NOT_FOUND'
);

