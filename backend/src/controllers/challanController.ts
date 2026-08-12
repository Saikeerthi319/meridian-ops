import { NextFunction, Request, Response } from 'express';
import * as challanService from '../services/challanService';
import { sendSuccess } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await challanService.listChallans(req.query as never);
    return sendSuccess(res, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.getChallan(req.params.id);
    return sendSuccess(res, challan);
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.createChallan(
      req.user!.userId,
      req.body.customerId,
      req.body.items,
    );
    return sendSuccess(res, challan, 201);
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.updateDraftChallan(req.params.id, req.body);
    return sendSuccess(res, challan);
  } catch (error) {
    return next(error);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.confirmChallan(req.params.id, req.user!.userId);
    return sendSuccess(res, challan);
  } catch (error) {
    return next(error);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const challan = await challanService.cancelChallan(
      req.params.id,
      req.user!.userId,
      req.user!.role,
    );
    return sendSuccess(res, challan);
  } catch (error) {
    return next(error);
  }
}
