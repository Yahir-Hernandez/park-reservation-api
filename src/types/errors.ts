
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
    | 'END_SEASON_MUST_BE_AFTER_START_SEASON'
    | 'CAPACITY_CAMPING_MUST_BE_POSITIVE'
    | 'CAPACITY_CABINETS_MUST_BE_POSITIVE';


export interface ErrorService {
  textCode: ErrorTextCode;
  message: string;
}

export type Result<T> = Promise<[T | null, ErrorService | null]>;