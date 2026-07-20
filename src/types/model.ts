import { Result } from '../types/errors';

export interface Model<T> {
  getAll(): Promise<Result<T[]>>;
  getById(id: string): Promise<Result<T>>;
  create(data: Omit<T, 'id'>): Promise<Result<T>>;
  update(id: string, data: Partial<T>): Promise<Result<T>>;
  delete(id: string): Promise<Result<boolean>>;
}
