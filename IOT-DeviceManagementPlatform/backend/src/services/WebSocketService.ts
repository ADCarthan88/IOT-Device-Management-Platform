import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RedisService } from './RedisService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class WebSocketService {
  private static io: SocketIOServer;
  private static connectedUsers = new Map<string, string>(); // userId -> socketId

  static initialize(io: SocketIOServer): void {
    this.io = io;

    // Authentication middleware
    io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });

    logger.info('WebSocket service initialized');
  }

  private static handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    // Store user connection
    this.connectedUsers.set(userId, socket.id);

    logger.info(`User ${userId} connected via WebSocket`);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Join role-based rooms
    socket.join(`role:${userRole}`);

    // Handle device-specific subscriptions
    socket.on('subscribe:device', (deviceId: string) => {
      socket.join(`device:${deviceId}`);
      logger.debug(`User ${userId} subscribed to device ${deviceId}`);
    });

    socket.on('unsubscribe:device', (deviceId: string) => {
      socket.leave(`device:${deviceId}`);
      logger.debug(`User ${userId} unsubscribed from device ${deviceId}`);
    });

    // Handle organization subscriptions
    socket.on('subscribe:organization', (orgId: string) => {
      socket.join(`org:${orgId}`);
      logger.debug(`User ${userId} subscribed to organization ${orgId}`);
    });

    // Handle real-time device commands
    socket.on('device:command', async (data: { deviceId: string; command: string; payload?: any }) => {
      try {
        await this.handleDeviceCommand(socket, data);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send device command', error });
      }
    });

    // Handle chat messages (for support)
    socket.on('chat:message', (data: { message: string; room: string }) => {
      socket.to(data.room).emit('chat:message', {
        message: data.message,
        userId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { room: string }) => {
      socket.to(data.room).emit('typing:start', { userId });
    });

    socket.on('typing:stop', (data: { room: string }) => {
      socket.to(data.room).emit('typing:stop', { userId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.connectedUsers.delete(userId);
      logger.info(`User ${userId} disconnected from WebSocket`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to IoT Platform',
      userId,
      timestamp: new Date().toISOString()
    });
  }

  private static async handleDeviceCommand(
    socket: AuthenticatedSocket,
    data: { deviceId: string; command: string; payload?: any }
  ): Promise<void> {
    const { deviceId, command, payload } = data;
    const userId = socket.userId!;

    // Log the command
    logger.info(`User ${userId} sending command '${command}' to device ${deviceId}`);

    // Store command in Redis for device to pick up
    const commandData = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      command,
      payload,
      userId,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    await RedisService.lPush(`device:${deviceId}:commands`, JSON.stringify(commandData));

    // Notify device via its channel
    this.io.to(`device:${deviceId}`).emit('device:command', commandData);

    // Acknowledge command receipt
    socket.emit('command:sent', {
      commandId: commandData.id,
      deviceId,
      status: 'sent'
    });
  }

  // Public methods for sending messages
  static emitToUser(userId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  static emitToDevice(deviceId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`device:${deviceId}`).emit(event, data);
    }
  }

  static emitToRole(role: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
    }
  }

  static emitToOrganization(orgId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`org:${orgId}`).emit(event, data);
    }
  }

  static broadcastToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Device status updates
  static async notifyDeviceStatusChange(deviceId: string, status: string, metadata?: any): Promise<void> {
    const statusUpdate = {
      deviceId,
      status,
      metadata,
      timestamp: new Date().toISOString()
    };

    // Emit to all users subscribed to this device
    this.emitToDevice(deviceId, 'device:status', statusUpdate);

    // Store in Redis for persistence
    await RedisService.setJSON(`device:${deviceId}:status`, '$', statusUpdate, 3600); // 1 hour TTL
  }

  // Device data updates
  static async notifyDeviceDataUpdate(deviceId: string, data: any): Promise<void> {
    const dataUpdate = {
      deviceId,
      data,
      timestamp: new Date().toISOString()
    };

    // Emit to all users subscribed to this device
    this.emitToDevice(deviceId, 'device:data', dataUpdate);

    // Store latest data in Redis
    await RedisService.setJSON(`device:${deviceId}:data`, '$', dataUpdate, 300); // 5 minutes TTL
  }

  // Alert notifications
  static async notifyAlert(alert: {
    id: string;
    type: string;
    severity: string;
    message: string;
    deviceId?: string;
    userId?: string;
    organizationId?: string;
  }): Promise<void> {
    const alertData = {
      ...alert,
      timestamp: new Date().toISOString()
    };

    // Send to specific user if specified
    if (alert.userId) {
      this.emitToUser(alert.userId, 'alert', alertData);
    }

    // Send to organization if specified
    if (alert.organizationId) {
      this.emitToOrganization(alert.organizationId, 'alert', alertData);
    }

    // Send to device subscribers if device-related
    if (alert.deviceId) {
      this.emitToDevice(alert.deviceId, 'alert', alertData);
    }

    // Send to all admins for critical alerts
    if (alert.severity === 'critical') {
      this.emitToRole('admin', 'alert', alertData);
    }
  }

  // Get connected users count
  static getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users
  static getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is connected
  static isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}