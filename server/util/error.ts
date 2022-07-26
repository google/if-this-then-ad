import { Request, Response, NextFunction } from 'express';
import { log } from '@iftta/util';

/**
 * A error implementation for Express error handling.
 *
 * This class allows to specify status codes to be passed with the error
 * so that Express can respond accordingly.
 *
 * @param {string} message the error message
 * @param {number} statusCode the HTTP status code associated with this error
 */
export class AppError extends Error {
  constructor(message: string, readonly statusCode = 500) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Implements default error handling for API calls.
 *
 * Express' default error handler responds with HTML. This handler transforms
 * errors into JSON API responses. If the application is running in
 * development mode, the full JSON-ified error will be returned, otherwise
 * only the error message will be returned.
 */
export function handleGenericError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let status: number = 500;
  let responseBody: Record<string, any> = {};

  if (res.headersSent) {
    next(err);
  }
  if (!(err instanceof Error)) {
    err = new Error(JSON.stringify(err));
  }

  if ('statusCode' in err) {
    status = err.statusCode;
  }

  responseBody.message = err.message;
  if (process.env.NODE_ENV === 'development') {
    responseBody['stack'] = JSON.stringify(err.stack);
  }
  res.status(status).json(responseBody);
}
