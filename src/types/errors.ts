
export type ErrorTextCode = 'USERNAME_ALREADY_EXISTS'
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'RESERVATION_NOT_FOUND'
  | 'PARK_NOT_FOUND'
  | 'RESERVATION_ALREADY_EXISTS'
  | 'PARK_ALREADY_EXISTS'
  | 'RESERVATION_FILTER_NOT_FOUND'
  | 'EMAIL_ALREADY_EXISTS'
  | 'DATA_DOES_NOT_COMPLY_WITH_BUSINESS_RULES'
  | 'CABIN_NOT_FOUND';

export interface ErrorService {
  textCode: ErrorTextCode;
  message: string;
  status: 400 | 401 | 403 | 404 | 409 | 500 | 422;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorService };