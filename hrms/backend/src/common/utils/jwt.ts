import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { RoleName } from '@hrms/shared';

export interface AccessTokenPayload {
  sub: string;
  orgId: string;
  role: RoleName;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  orgId: string;
  sessionId: string;
  type: 'refresh';
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const signTempToken = (payload: { sub: string; orgId: string; purpose: string }): string => {
  return jwt.sign(payload, env.JWT_TEMP_SECRET, { expiresIn: '10m' });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

export const verifyTempToken = (
  token: string,
): {
  sub: string;
  orgId: string;
  purpose: string;
} => {
  return jwt.verify(token, env.JWT_TEMP_SECRET) as {
    sub: string;
    orgId: string;
    purpose: string;
  };
};

export const hashValue = async (value: string): Promise<string> => {
  return bcrypt.hash(value, 12);
};

export const compareHash = async (value: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(value, hash);
};
