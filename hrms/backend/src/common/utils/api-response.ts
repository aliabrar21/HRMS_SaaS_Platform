import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '@hrms/shared';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  pagination?: PaginationMeta,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    pagination,
  });
};

export const sendError = (
  res: Response,
  message = 'Unexpected error',
  statusCode = 500,
): Response<ApiResponse<null>> => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
  });
};
