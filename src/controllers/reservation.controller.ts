import { Request, Response } from 'express';
import { ReservationService } from '@/services/reservation.service';
import { reservationModel } from '@/models/reservation';
import { sendResult, sendValidationError } from '@/utils/http';
import { Reservation } from '@/types/model';
import { isFiniteNumber, missingFields, parseDate, parseIntParam } from '@/utils/validation';

export class ReservationController {
  static async create(req: Request, res: Response): Promise<void> {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const missing = missingFields(body, ['parkId', 'startDate', 'endDate', 'people', 'visitType']);
    if (missing.length > 0) {
      sendValidationError(res, `Missing required fields: ${missing.join(', ')}.`);
      return;
    }
    if (!isFiniteNumber(body.parkId) || !isFiniteNumber(body.people)) {
      sendValidationError(res, '"parkId" and "people" must be numbers.');
      return;
    }
    if (body.people <= 0) {
      sendValidationError(res, '"people" must be greater than zero.');
      return;
    }
    if (body.visitType !== 'cabaña' && body.visitType !== 'camping') {
      sendValidationError(res, '"visitType" must be either "cabaña" or "camping".');
      return;
    }
    if (body.visitType === 'cabaña' && !isFiniteNumber(body.cabinId)) {
      sendValidationError(res, '"cabinId" is required and must be a number when "visitType" is "cabaña".');
      return;
    }
    const startDate = parseDate(body.startDate);
    const endDate = parseDate(body.endDate);
    if (!startDate || !endDate) {
      sendValidationError(res, '"startDate" and "endDate" must be valid dates.');
      return;
    }
    // Se valida aquí (capa HTTP) para evitar que `eachDayOfInterval` (usado en
    // `ReservationService.hasClosedDayInRange`) lance una excepción con un
    // rango invertido, lo que terminaba mapeándose incorrectamente a un 500
    // en vez de un 422 por regla de negocio.
    if (startDate > endDate) {
      sendValidationError(res, '"startDate" must be before or equal to "endDate".');
      return;
    }

    // El usuario dueño de la reservación es siempre el usuario autenticado,
    // salvo que un administrador indique explícitamente un "userId" distinto
    // en el body (para reservar en nombre de un cliente). Esto evita que un
    // cliente pueda crear reservaciones a nombre de otro usuario.
    const requester = req.user!;
    const userId = requester.role === 'administrador' && typeof body.userId === 'string'
      ? body.userId
      : requester.id;

    const reservationPayload = {
      id: 0,
      userId,
      parkId: body.parkId,
      cabinId: body.visitType === 'cabaña' ? (body.cabinId as number) : null,
      startDate,
      endDate,
      people: body.people,
      visitType: body.visitType,
      status: 'activa',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Reservation;

    const result = await ReservationService.create(reservationPayload);
    sendResult(res, result, 201);
  }

  static async listMine(req: Request, res: Response): Promise<void> {
    const result = await ReservationService.listByUser(req.user!.id);
    sendResult(res, result);
  }

  static async listAll(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const result = await ReservationService.listAllPaginated(page, pageSize);
    sendResult(res, result);
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The reservation id must be an integer.');
      return;
    }
    const result = await reservationModel.getById(id);
    if (!result.ok) {
      sendResult(res, result);
      return;
    }
    const requester = req.user!;
    if (requester.role === 'cliente' && result.data.userId !== requester.id) {
      res.status(403).json({
        ok: false,
        error: { textCode: 'UNAUTHORIZED', message: 'You do not have permission to view this reservation.' },
      });
      return;
    }
    res.status(200).json({ ok: true, data: result.data });
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      sendValidationError(res, 'The reservation id must be an integer.');
      return;
    }
    const requester = req.user!;
    const result = await ReservationService.cancel(id, requester.id, requester.role);
    sendResult(res, result);
  }
}
