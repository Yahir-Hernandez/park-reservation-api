import { Request, Response } from 'express';
import { parkModel } from '@/models/park';
import { ParkService, EditableParkFields } from '@/services/park.service';
import { sendResult, sendValidationError } from '@/utils/http';
import { Park } from '@/types/model';
import { isFiniteNumber, isNonEmptyString, isStringArray, missingFields, parseDate, parseIntParam } from '@/utils/validation';

export class ParkController {
  static async list(_req: Request, res: Response): Promise<void> {
    const result = await parkModel.getAll();
    sendResult(res, result);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The park id must be an integer.');
      return;
    }
    const result = await parkModel.getById(id);
    sendResult(res, result);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const required = [
      'name', 'location', 'services', 'openingTime', 'closingTime',
      'latitude', 'longitude', 'startSeason', 'endSeason', 'closeDays', 'capacityCamping',
    ];
    const missing = missingFields(body, required);
    if (missing.length > 0) {
      sendValidationError(res, `Missing required fields: ${missing.join(', ')}.`);
      return;
    }
    if (!isStringArray(body.services) || !isStringArray(body.closeDays)) {
      sendValidationError(res, '"services" and "closeDays" must be arrays of strings.');
      return;
    }
    if (!isFiniteNumber(body.latitude) || !isFiniteNumber(body.longitude) || !isFiniteNumber(body.capacityCamping)) {
      sendValidationError(res, '"latitude", "longitude" and "capacityCamping" must be numbers.');
      return;
    }
    const openingTime = parseDate(body.openingTime);
    const closingTime = parseDate(body.closingTime);
    const startSeason = parseDate(body.startSeason);
    const endSeason = parseDate(body.endSeason);
    if (!openingTime || !closingTime || !startSeason || !endSeason) {
      sendValidationError(res, '"openingTime", "closingTime", "startSeason" and "endSeason" must be valid dates.');
      return;
    }
    if (!isNonEmptyString(body.name) || !isNonEmptyString(body.location)) {
      sendValidationError(res, '"name" and "location" must be non-empty strings.');
      return;
    }

    const parkPayload = {
      id: 0,
      name: body.name,
      location: body.location,
      services: body.services,
      openingTime,
      closingTime,
      latitude: body.latitude as unknown as Park['latitude'],
      longitude: body.longitude as unknown as Park['longitude'],
      startSeason,
      endSeason,
      closeDays: body.closeDays,
      hasCabins: typeof body.hasCabins === 'boolean' ? body.hasCabins : false,
      capacityCamping: body.capacityCamping,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Park;

    const result = await ParkService.createPark(parkPayload);
    sendResult(res, result, 201);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The park id must be an integer.');
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const changes: Partial<EditableParkFields> = {};

    if (body.location !== undefined) {
      if (!isNonEmptyString(body.location)) {
        sendValidationError(res, '"location" must be a non-empty string.');
        return;
      }
      changes.location = body.location;
    }
    if (body.services !== undefined) {
      if (!isStringArray(body.services)) {
        sendValidationError(res, '"services" must be an array of strings.');
        return;
      }
      changes.services = body.services;
    }
    if (body.closeDays !== undefined) {
      if (!isStringArray(body.closeDays)) {
        sendValidationError(res, '"closeDays" must be an array of strings.');
        return;
      }
      changes.closeDays = body.closeDays;
    }
    if (body.openingTime !== undefined) {
      const openingTime = parseDate(body.openingTime);
      if (!openingTime) {
        sendValidationError(res, '"openingTime" must be a valid date.');
        return;
      }
      changes.openingTime = openingTime;
    }
    if (body.closingTime !== undefined) {
      const closingTime = parseDate(body.closingTime);
      if (!closingTime) {
        sendValidationError(res, '"closingTime" must be a valid date.');
        return;
      }
      changes.closingTime = closingTime;
    }
    if (body.startSeason !== undefined) {
      const startSeason = parseDate(body.startSeason);
      if (!startSeason) {
        sendValidationError(res, '"startSeason" must be a valid date.');
        return;
      }
      changes.startSeason = startSeason;
    }
    if (body.endSeason !== undefined) {
      const endSeason = parseDate(body.endSeason);
      if (!endSeason) {
        sendValidationError(res, '"endSeason" must be a valid date.');
        return;
      }
      changes.endSeason = endSeason;
    }
    if (body.latitude !== undefined) {
      if (!isFiniteNumber(body.latitude)) {
        sendValidationError(res, '"latitude" must be a number.');
        return;
      }
      changes.latitude = body.latitude as unknown as Park['latitude'];
    }
    if (body.longitude !== undefined) {
      if (!isFiniteNumber(body.longitude)) {
        sendValidationError(res, '"longitude" must be a number.');
        return;
      }
      changes.longitude = body.longitude as unknown as Park['longitude'];
    }
    if (body.hasCabins !== undefined) {
      if (typeof body.hasCabins !== 'boolean') {
        sendValidationError(res, '"hasCabins" must be a boolean.');
        return;
      }
      changes.hasCabins = body.hasCabins;
    }
    if (body.capacityCamping !== undefined) {
      if (!isFiniteNumber(body.capacityCamping)) {
        sendValidationError(res, '"capacityCamping" must be a number.');
        return;
      }
      changes.capacityCamping = body.capacityCamping;
    }

    const result = await ParkService.editPark(id, changes);
    sendResult(res, result);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The park id must be an integer.');
      return;
    }
    const existing = await parkModel.getById(id);
    if (!existing.ok) {
      sendResult(res, existing);
      return;
    }
    const result = await ParkService.deletePark(existing.data);
    sendResult(res, result);
  }
}
