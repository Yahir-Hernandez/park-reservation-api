import { Result, ErrorService, ErrorTextCode } from "../types/errors";
import { BaseOmitKeys } from "../types/model";

interface PrismaDelegate<T, ID, CreateInput = Omit<T, BaseOmitKeys>> {
  findMany(): Promise<T[]>;
  findUnique(args: { where: { id: ID } }): Promise<T | null>;
  create(args: { data: CreateInput }): Promise<T>;
  update(args: { where: { id: ID }; data: any }): Promise<T>;
  delete(args: { where: { id: ID } }): Promise<T>;
}

export function createModel<T, ID, CreateInput = Omit<T, BaseOmitKeys>>(
  delegate: PrismaDelegate<T, ID, CreateInput>,
  modelName: string,
  notFoundCode: ErrorTextCode
) {
  const internalError = {
    ok: false as const,
    error:  {
      textCode: 'INTERNAL_ERROR',
      message: 'Server internal error',
      status: 500,
    } as ErrorService
  };

  return {
    async getAll(): Promise<Result<T[]>> {
      try {
        const records = await delegate.findMany();
        return { ok: true, data: records };
      } catch {
        return internalError;
      }
    },

    async getById(id: ID): Promise<Result<T>> {
      try {
        const record = await delegate.findUnique({ where: { id } });
        if (!record) {
          return {
            ok: false,
            error: {
              message: `${modelName} not found`,
              textCode: notFoundCode,
              status: 404,
            }
          };
        }
        return { ok: true, data: record };
      } catch {
        return internalError;
      }
    },

    async create(data: CreateInput): Promise<Result<T>> {
      try {
        const record = await delegate.create({ data });
        return { ok: true, data: record };
      } catch {
        return internalError;
      }
    },

    async update(id: ID, data: Partial<CreateInput>): Promise<Result<T>> {
      try {
        const record = await delegate.update({ where: { id }, data });
        return { ok: true, data: record };
      } catch {
        return internalError;
      }
    },

    async delete(id: ID): Promise<Result<T>> {
      try {
        const record = await delegate.delete({ where: { id } });
        return { ok: true, data: record };
      } catch {
        return internalError;
      }
    }
  };
}