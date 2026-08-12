import { NextFunction, Request, Response } from 'express';
import * as productService from '../services/productService';
import { sendSuccess } from '../utils/apiResponse';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productService.listProducts(req.query as never);
    return sendSuccess(res, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.getProduct(req.params.id);
    return sendSuccess(res, product);
  } catch (error) {
    return next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, product, 201);
  } catch (error) {
    return next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return sendSuccess(res, product);
  } catch (error) {
    return next(error);
  }
}
