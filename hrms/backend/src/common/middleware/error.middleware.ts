import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

interface HttpError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = error.statusCode ?? 500;
  const message = error.message || 'Internal server error';

  logger.error('API error', {
    message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: error.stack,
  });

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
  });
};
