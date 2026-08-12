import { Response } from 'express';

export type FieldError = { field: string; message: string };

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: Record<string, unknown>,
) {
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  errors?: FieldError[],
) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors?.length ? { errors } : {}),
  });
}
