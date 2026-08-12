import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodTypeAny } from 'zod';

type Schemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export function validate(schemas: Schemas | AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if ('parse' in schemas && typeof schemas.parse === 'function' && !('body' in schemas)) {
        req.body = (schemas as AnyZodObject).parse(req.body);
        return next();
      }

      const s = schemas as Schemas;
      if (s.body) req.body = s.body.parse(req.body);
      if (s.query) req.query = s.query.parse(req.query) as Request['query'];
      if (s.params) req.params = s.params.parse(req.params) as Request['params'];
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
