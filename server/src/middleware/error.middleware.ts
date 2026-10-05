import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Operational AppErrors (e.g. 400, 401, 403, 404, 429)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      ...(err.details && env.NODE_ENV !== 'production' ? { details: err.details } : {}),
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'BadRequestError',
      message: 'Invalid request data',
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  // Express body-parser JSON syntax error
  if ('type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({
      error: 'BadRequestError',
      message: 'Malformed JSON payload',
    });
    return;
  }

  // MongoDB duplicate key error (code 11000)
  if ('code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      error: 'ConflictError',
      message: 'A resource with this identifier already exists',
    });
    return;
  }

  // Unhandled / Unexpected Errors
  console.error('💥 Unexpected Server Error:', err);

  res.status(500).json({
    error: 'InternalServerError',
    message: 'An internal server error occurred. Please try again later.',
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
