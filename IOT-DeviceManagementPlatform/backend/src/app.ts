import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import { metricsMiddleware } from './middleware/metrics';

// Import routes
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import userRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import firmwareRoutes from './routes/firmware';
import alertRoutes from './routes/alerts';
import healthRoutes from './routes/health';

// Import services
import { RedisService } from './services/RedisService';
import { WebSocketService } from './services/WebSocketService';
import { MetricsService } from './services/MetricsService';

class Application {
  public app: express.Application;
  public server: any;
  public io: SocketIOServer;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.frontend.url,
        methods: ['GET', 'POST']
      }
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSwagger();
    this.initializeServices();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(compression());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.frontend.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Custom middleware
    this.app.use(requestLogger);
    this.app.use(metricsMiddleware);
  }

  private initializeRoutes(): void {
    // Health check route (no auth required)
    this.app.use('/health', healthRoutes);

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/devices', authMiddleware, deviceRoutes);
    this.app.use('/api/users', authMiddleware, userRoutes);
    this.app.use('/api/analytics', authMiddleware, analyticsRoutes);
    this.app.use('/api/firmware', authMiddleware, firmwareRoutes);
    this.app.use('/api/alerts', authMiddleware, alertRoutes);

    // Metrics endpoint for Prometheus
    this.app.get('/metrics', async (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.end(await MetricsService.getMetrics());
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeSwagger(): void {
    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'IoT Device Management Platform API',
          version: '1.0.0',
          description: 'Comprehensive API for managing IoT devices, users, and analytics',
          contact: {
            name: 'Adam Carthan',
            email: 'adam@example.com'
          },
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: ['./src/routes/*.ts', './src/controllers/*.ts']
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'IoT Platform API Documentation'
    }));
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Redis connection
      await RedisService.connect();
      logger.info('Redis connected successfully');

      // Initialize WebSocket service
      WebSocketService.initialize(this.io);
      logger.info('WebSocket service initialized');

      // Initialize metrics collection
      MetricsService.initialize();
      logger.info('Metrics service initialized');

    } catch (error) {
      logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  public listen(): void {
    this.server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
      logger.info(`📊 Metrics: http://localhost:${config.port}/metrics`);
      logger.info(`🏥 Health Check: http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
    process.on('SIGINT', this.gracefulShutdown.bind(this));
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info('Starting graceful shutdown...');

    this.server.close(() => {
      logger.info('HTTP server closed');
    });

    await RedisService.disconnect();
    logger.info('Redis disconnected');

    process.exit(0);
  }
}

export default Application;