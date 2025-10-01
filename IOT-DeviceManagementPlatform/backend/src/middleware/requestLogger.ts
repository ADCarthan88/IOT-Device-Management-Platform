import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  // Log the request
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding?: BufferEncoding | (() => void), cb?: () => void): Response {
    const duration = Date.now() - start;
    
    logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
    });

    // Call the original end method
    if (typeof encoding === 'function') {
      originalEnd.call(this, chunk, encoding);
    } else {
      originalEnd.call(this, chunk, encoding, cb);
    }

    return this;
  };

  next();
};