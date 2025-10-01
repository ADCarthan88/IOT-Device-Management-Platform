import { Router, Request, Response } from 'express';
import { RedisService } from '../services/RedisService';
import { logger } from '../utils/logger';

const router = Router();

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    memory: {
      status: 'healthy' | 'warning' | 'critical';
      usage: number;
      free: number;
      total: number;
    };
  };
  version: string;
  environment: string;
}

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and its dependencies
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                 services:
 *                   type: object
 *       503:
 *         description: Application is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'healthy',
      redis: 'healthy',
      memory: {
        status: 'healthy',
        usage: 0,
        free: 0,
        total: 0
      }
    },
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Check Redis connection
    try {
      await RedisService.get('health-check');
      healthCheck.services.redis = 'healthy';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      healthCheck.services.redis = 'unhealthy';
      healthCheck.status = 'unhealthy';
    }

    // Check database connection (would be implemented with actual DB service)
    // For now, assume it's healthy if the service is running
    healthCheck.services.database = 'healthy';

    // Check memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    healthCheck.services.memory = {
      status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 70 ? 'warning' : 'healthy',
      usage: Math.round(memoryUsagePercent),
      free: freeMemory,
      total: totalMemory
    };

    // Set overall status
    if (healthCheck.services.redis === 'unhealthy' || 
        healthCheck.services.database === 'unhealthy' ||
        healthCheck.services.memory.status === 'critical') {
      healthCheck.status = 'unhealthy';
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthCheck);

  } catch (error) {
    logger.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime()
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness check endpoint
 *     description: Returns whether the application is ready to serve requests
 *     responses:
 *       200:
 *         description: Application is ready
 *       503:
 *         description: Application is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if all critical services are available
    await RedisService.get('readiness-check');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Critical services unavailable'
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness check endpoint
 *     description: Returns whether the application is alive
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;