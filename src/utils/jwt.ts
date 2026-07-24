import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env';
import { User } from '@/types/model';

export interface JwtPayload {
  sub: string;
  role: User['role'];
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (typeof decoded === 'string') return null;
    if (typeof decoded.sub !== 'string' || typeof decoded.role !== 'string') return null;
    return { sub: decoded.sub, role: decoded.role as User['role'] };
  } catch {
    return null;
  }
}
