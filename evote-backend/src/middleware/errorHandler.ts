import { Request, Response, NextFunction } from 'express';
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || err.status || 500;
  const code = err.code || err.error || 'internal';
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  // Always log full error server-side
  console.error('[ERROR]', err);
  // Send concise error to client; include message in dev only
  res.status(status).json({ error: code, ...(isProd ? {} : { message: err.message }) });
}