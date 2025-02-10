import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

const isDevEnv = process.env.NODE_ENV === 'development'

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  type message = string;
  let message: message = 'Something went wrong';
  let data: unknown;
  let status: number = 500;

  if (err instanceof ZodError) {
      message = err.issues.map((err) => `${err.path.pop()}: ${err.message}`).join(', ');
      status = 422;
  };
  
  res.status(status).json({ error: true, message, data: data ?? null, ...(isDevEnv && { serverError: (err as Error).message }) });
};