import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/apiResponse';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return sendError(
      res,
      400,
      'Validation failed',
      err.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      })),
    );
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  console.error(err);
  return sendError(res, 500, 'Internal server error');
}
