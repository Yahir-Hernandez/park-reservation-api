import { User } from '@/types/model';

export interface AuthenticatedUser {
  id: string;
  role: User['role'];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
