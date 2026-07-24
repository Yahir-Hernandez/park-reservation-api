import { Request, Response } from 'express';
import { cabinModel } from '@/models/cabin';
import { parkModel } from '@/models/park';
import { CabinServices } from '@/services/cabin.service';
import { sendResult, sendValidationError } from '@/utils/http';
import { Cabin } from '@/types/model';
import { isFiniteNumber, isNonEmptyString, parseIntParam } from '@/utils/validation';

export class CabinController {
  static async listByPark(req: Request, res: Response): Promise<void> {
    const parkId = parseIntParam(req.params.parkId);
    if (parkId === null) {
      sendValidationError(res, 'The park id must be an integer.');
      return;
    }
    const result = await cabinModel.findByPark(parkId);
    sendResult(res, result);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The cabin id must be an integer.');
      return;
    }
    const result = await cabinModel.getById(id);
    sendResult(res, result);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const parkId = parseIntParam(req.params.parkId);
    if (parkId === null) {
      sendValidationError(res, 'The park id must be an integer.');
      return;
    }
    const parkResult = await parkModel.getById(parkId);
    if (!parkResult.ok) {
      sendResult(res, parkResult);
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const rawCabins = body.cabins;
    if (!Array.isArray(rawCabins) || rawCabins.length === 0) {
      sendValidationError(res, '"cabins" must be a non-empty array of { name, capacity }.');
      return;
    }

    const cabins: Cabin[] = [];
    for (const raw of rawCabins) {
      const item = (raw ?? {}) as Record<string, unknown>;
      if (!isNonEmptyString(item.name) || !isFiniteNumber(item.capacity)) {
        sendValidationError(res, 'Each cabin must have a non-empty "name" and a numeric "capacity".');
        return;
      }
      cabins.push({
        id: 0,
        name: item.name,
        parkId,
        capacity: item.capacity,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const result = await CabinServices.add(parkResult.data, cabins);
    sendResult(res, result, 201);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The cabin id must be an integer.');
      return;
    }
    const existing = await cabinModel.getById(id);
    if (!existing.ok) {
      sendResult(res, existing);
      return;
    }
    const result = await CabinServices.remove(existing.data);
    sendResult(res, result);
  }
}
