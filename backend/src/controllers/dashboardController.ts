import { NextFunction, Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { sendSuccess } from '../utils/apiResponse';

export async function get(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDashboard();
    return sendSuccess(res, data);
  } catch (error) {
    return next(error);
  }
}
