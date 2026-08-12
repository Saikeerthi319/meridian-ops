import { NextFunction, Request, Response } from 'express';
import * as stockService from '../services/stockService';
import { sendSuccess } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await stockService.listMovements(req.query as never);
    return sendSuccess(res, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const movement = await stockService.createManualMovement({
      ...req.body,
      createdById: req.user!.userId,
    });
    return sendSuccess(res, movement, 201);
  } catch (error) {
    return next(error);
  }
}
