import { ParkModel, CreateParkInput, Park } from "@/types/model";
import { prisma } from "@/db/config";
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