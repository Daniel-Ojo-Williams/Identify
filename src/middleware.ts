import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema } from 'zod';

interface ParsedRequest {
  body: Request['body'];
  query: Request['query'];
  params: Request['params'];
}

export const validator = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsedRequest: ParsedRequest = schema.parse({ body: req.body, query: req.query, params: req.params });

        req.body = parsedRequest.body;
        req.params = parsedRequest.params;
        req.query = parsedRequest.query;

        next();
    } catch (error) {
        next(error);
    }
};