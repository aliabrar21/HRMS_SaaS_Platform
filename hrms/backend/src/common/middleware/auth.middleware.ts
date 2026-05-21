import type { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/api-response.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    sendError(res, 'Unauthorized', 401);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      orgId: payload.orgId,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};
