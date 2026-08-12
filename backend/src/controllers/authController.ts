import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/authService';
import { sendSuccess } from '../utils/apiResponse';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
}
