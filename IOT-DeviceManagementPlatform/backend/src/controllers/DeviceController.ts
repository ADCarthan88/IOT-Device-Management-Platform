import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { RedisService } from '../services/RedisService';
import { WebSocketService } from '../services/WebSocketService';
import { MetricsService } from '../services/MetricsService';

interface Device {
  id: string;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'controller';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  description?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  metadata?: Record<string, any>;
  organizationId: string;
  ownerId: string;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface DeviceData {
  id: string;
  deviceId: string;
  timestamp: Date;
  data: Record<string, any>;
  dataType: string;
}

export class DeviceController {
  /**
   * Get all devices with pagination and filtering
   */
  static async getAllDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const type = req.query.type as string;

      // In a real implementation, this would query a database
      // For now, we'll simulate with Redis
      const deviceKeys = await RedisService.keys('device:*');
      let devices: Device[] = [];

      for (const key of deviceKeys) {
        if (key.includes(':data') || key.includes(':commands')) continue;
        
        const device = await RedisService.getJSON(key, '$') as Device;
        if (device && device.id) {
          // Filter by user's organization (in real app)
          // For now, include all devices
          devices.push(device);
        }
      }

      // Apply filters
      if (status) {
        devices = devices.filter(device => device.status === status);
      }
      if (type) {
        devices = devices.filter(device => device.type === type);
      }

      // Apply pagination
      const total = devices.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedDevices = devices.slice(startIndex, endIndex);

      // Update metrics
      MetricsService.updateDeviceCount(
        total,
        devices.filter(d => d.status === 'online').length
      );

      res.json({
        success: true,
        data: {
          devices: paginatedDevices,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get all devices error:', error);
      throw error;
    }
  }

  /**
   * Create a new device
   */
  static async createDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, type, description, location, metadata } = req.body;
      const userId = req.user!.id;

      // Validation
      if (!name || !type) {
        throw new ValidationError('Name and type are required');
      }

      const validTypes = ['sensor', 'actuator', 'gateway', 'controller'];
      if (!validTypes.includes(type)) {
        throw new ValidationError('Invalid device type');
      }

      // Create device
      const device: Device = {
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type,
        status: 'offline',
        description: description || '',
        location,
        metadata: metadata || {},
        organizationId: 'org_default', // In real app, get from user
        ownerId: userId,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store device
      await RedisService.setJSON(`device:${device.id}`, '$', device);

      // Add to user's devices list
      await RedisService.sAdd(`user:${userId}:devices`, device.id);

      // Notify via WebSocket
      WebSocketService.emitToUser(userId, 'device:created', device);

      logger.info(`Device created: ${device.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Device created successfully',
        data: device
      });
    } catch (error) {
      logger.error('Create device error:', error);
      throw error;
    }
  }

  /**
   * Get device by ID
   */
  static async getDeviceById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      // TODO: Check if user has access to this device

      res.json({
        success: true,
        data: device
      });
    } catch (error) {
      logger.error('Get device by ID error:', error);
      throw error;
    }
  }

  /**
   * Update device
   */
  static async updateDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, location, metadata } = req.body;

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      // TODO: Check if user has permission to update this device

      // Update device
      if (name) device.name = name;
      if (description !== undefined) device.description = description;
      if (location) device.location = location;
      if (metadata) device.metadata = { ...device.metadata, ...metadata };
      device.updatedAt = new Date();

      // Save updated device
      await RedisService.setJSON(`device:${device.id}`, '$', device);

      // Notify via WebSocket
      WebSocketService.emitToDevice(device.id, 'device:updated', device);

      logger.info(`Device updated: ${device.id}`);

      res.json({
        success: true,
        message: 'Device updated successfully',
        data: device
      });
    } catch (error) {
      logger.error('Update device error:', error);
      throw error;
    }
  }

  /**
   * Delete device
   */
  static async deleteDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      // TODO: Check if user has permission to delete this device

      // Delete device and related data
      await RedisService.del(`device:${device.id}`);
      await RedisService.del(`device:${device.id}:data`);
      await RedisService.del(`device:${device.id}:commands`);

      // Remove from user's devices list
      await RedisService.sRem(`user:${userId}:devices`, device.id);

      // Notify via WebSocket
      WebSocketService.emitToDevice(device.id, 'device:deleted', { deviceId: device.id });

      logger.info(`Device deleted: ${device.id}`);

      res.json({
        success: true,
        message: 'Device deleted successfully'
      });
    } catch (error) {
      logger.error('Delete device error:', error);
      throw error;
    }
  }

  /**
   * Get device data
   */
  static async getDeviceData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const from = req.query.from as string;
      const to = req.query.to as string;
      const limit = parseInt(req.query.limit as string) || 100;

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      // Get device data from Redis (in real app, this would be from a time-series database)
      const dataKeys = await RedisService.keys(`device:${id}:data:*`);
      let deviceDataList: DeviceData[] = [];

      for (const key of dataKeys.slice(0, limit)) {
        const data = await RedisService.getJSON(key, '$') as DeviceData;
        if (data) {
          deviceDataList.push(data);
        }
      }

      // Filter by date range if provided
      if (from || to) {
        deviceDataList = deviceDataList.filter(data => {
          const timestamp = new Date(data.timestamp);
          if (from && timestamp < new Date(from)) return false;
          if (to && timestamp > new Date(to)) return false;
          return true;
        });
      }

      // Sort by timestamp (newest first)
      deviceDataList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json({
        success: true,
        data: deviceDataList.slice(0, limit)
      });
    } catch (error) {
      logger.error('Get device data error:', error);
      throw error;
    }
  }

  /**
   * Add device data
   */
  static async addDeviceData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { data, dataType, timestamp } = req.body;

      if (!data || !dataType) {
        throw new ValidationError('Data and dataType are required');
      }

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      // Create data entry
      const deviceData: DeviceData = {
        id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceId: id,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        data,
        dataType
      };

      // Store data
      await RedisService.setJSON(`device:${id}:data:${deviceData.id}`, '$', deviceData, 86400); // 24 hours TTL

      // Update device last seen
      device.lastSeen = new Date();
      if (device.status === 'offline') {
        device.status = 'online';
      }
      await RedisService.setJSON(`device:${device.id}`, '$', device);

      // Notify via WebSocket
      WebSocketService.notifyDeviceDataUpdate(id, deviceData);

      // Update metrics
      MetricsService.recordDataPoint(id, dataType);

      logger.info(`Data added for device: ${id}`);

      res.status(201).json({
        success: true,
        message: 'Data added successfully',
        data: deviceData
      });
    } catch (error) {
      logger.error('Add device data error:', error);
      throw error;
    }
  }

  /**
   * Send command to device
   */
  static async sendCommand(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { command, payload } = req.body;
      const userId = req.user!.id;

      if (!command) {
        throw new ValidationError('Command is required');
      }

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      if (device.status === 'offline') {
        res.json({
          success: false,
          message: 'Cannot send command to offline device',
          data: { deviceId: id, status: 'failed' }
        });
        return;
      }

      // Create command
      const commandData = {
        id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceId: id,
        command,
        payload,
        userId,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // Store command for device to pick up
      await RedisService.lPush(`device:${id}:commands`, JSON.stringify(commandData));

      // Notify device via WebSocket
      WebSocketService.emitToDevice(id, 'device:command', commandData);

      // Update metrics
      MetricsService.recordDeviceCommand(id, command, 'sent');

      logger.info(`Command sent to device ${id}: ${command}`);

      res.json({
        success: true,
        message: 'Command sent successfully',
        data: {
          commandId: commandData.id,
          deviceId: id,
          status: 'sent'
        }
      });
    } catch (error) {
      logger.error('Send command error:', error);
      throw error;
    }
  }

  /**
   * Update device status
   */
  static async updateDeviceStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      if (!status) {
        throw new ValidationError('Status is required');
      }

      const validStatuses = ['online', 'offline', 'maintenance', 'error'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError('Invalid status');
      }

      const device = await DeviceController.findDeviceById(id);
      if (!device) {
        throw new NotFoundError('Device not found');
      }

      const oldStatus = device.status;
      device.status = status;
      device.lastSeen = new Date();
      device.updatedAt = new Date();

      // Save updated device
      await RedisService.setJSON(`device:${device.id}`, '$', device);

      // Notify via WebSocket
      WebSocketService.notifyDeviceStatusChange(id, status, { message, oldStatus });

      logger.info(`Device status updated: ${id} - ${oldStatus} -> ${status}`);

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: {
          deviceId: id,
          status,
          previousStatus: oldStatus
        }
      });
    } catch (error) {
      logger.error('Update device status error:', error);
      throw error;
    }
  }

  // Helper method
  private static async findDeviceById(id: string): Promise<Device | null> {
    try {
      const device = await RedisService.getJSON(`device:${id}`, '$') as Device;
      return device;
    } catch (error) {
      logger.error('Error finding device by ID:', error);
      return null;
    }
  }
}