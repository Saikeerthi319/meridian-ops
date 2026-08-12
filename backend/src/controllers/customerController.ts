import { NextFunction, Request, Response } from 'express';
import * as customerService from '../services/customerService';
import { sendSuccess } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await customerService.listCustomers(req.query as never);
    return sendSuccess(res, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.getCustomer(req.params.id);
    return sendSuccess(res, customer);
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, customer, 201);
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return sendSuccess(res, customer);
  } catch (error) {
    return next(error);
  }
}

export async function listFollowUps(req: Request, res: Response, next: NextFunction) {
  try {
    const followUps = await customerService.listFollowUps(req.params.id);
    return sendSuccess(res, followUps);
  } catch (error) {
    return next(error);
  }
}

export async function addFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const followUp = await customerService.addFollowUp(
      req.params.id,
      req.user!.userId,
      req.body.note,
      req.body.followUpDate,
    );
    return sendSuccess(res, followUp, 201);
  } catch (error) {
    return next(error);
  }
}
