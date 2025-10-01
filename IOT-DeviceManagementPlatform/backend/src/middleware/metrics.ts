import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/MetricsService';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function(chunk: any, encoding?: BufferEncoding | (() => void), cb?: () => void): Response {
    const duration = Date.now() - start;
    
    // Record metrics
    MetricsService.recordHttpRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration
    );

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