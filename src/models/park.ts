import { ParkModel, CreateParkInput } from "../types/model";
import { prisma } from "../db/config";
import { Park } from "../generated/prisma/client";
import { createModel } from "./generic";

export const parkModel: ParkModel = createModel<
  Park,
  number,
  CreateParkInput
>(
  prisma.park,
  'Park',
  'PARK_NOT_FOUND'
);