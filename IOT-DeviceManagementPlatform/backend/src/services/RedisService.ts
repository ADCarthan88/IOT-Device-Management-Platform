import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import { logger } from '../utils/logger';

export class RedisService {
  private static client: RedisClientType;
  private static isConnected = false;

  static async connect(): Promise<void> {
    try {
      this.client = createClient({
        url: config.redis.url,
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis Client Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  static getClient(): RedisClientType {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  // Cache operations
  static async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = this.getClient();
    if (ttlSeconds) {
      await client.setEx(key, ttlSeconds, value);
    } else {
      await client.set(key, value);
    }
  }

  static async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.get(key);
  }

  static async del(key: string): Promise<number> {
    const client = this.getClient();
    return await client.del(key);
  }

  static async exists(key: string): Promise<number> {
    const client = this.getClient();
    return await client.exists(key);
  }

  // Hash operations
  static async hSet(key: string, field: string, value: string): Promise<number> {
    const client = this.getClient();
    return await client.hSet(key, field, value);
  }

  static async hGet(key: string, field: string): Promise<string | undefined> {
    const client = this.getClient();
    return await client.hGet(key, field);
  }

  static async hGetAll(key: string): Promise<Record<string, string>> {
    const client = this.getClient();
    return await client.hGetAll(key);
  }

  static async hDel(key: string, field: string): Promise<number> {
    const client = this.getClient();
    return await client.hDel(key, field);
  }

  // List operations
  static async lPush(key: string, value: string): Promise<number> {
    const client = this.getClient();
    return await client.lPush(key, value);
  }

  static async rPop(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.rPop(key);
  }

  static async lLen(key: string): Promise<number> {
    const client = this.getClient();
    return await client.lLen(key);
  }

  // Set operations
  static async sAdd(key: string, member: string): Promise<number> {
    const client = this.getClient();
    return await client.sAdd(key, member);
  }

  static async sRem(key: string, member: string): Promise<number> {
    const client = this.getClient();
    return await client.sRem(key, member);
  }

  static async sMembers(key: string): Promise<string[]> {
    const client = this.getClient();
    return await client.sMembers(key);
  }

  // JSON operations (if Redis Stack is available)
  static async setJSON(key: string, path: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const client = this.getClient();
      await (client as any).json.set(key, path, value);
      if (ttlSeconds) {
        await client.expire(key, ttlSeconds);
      }
    } catch (error) {
      // Fallback to regular string storage
      await this.set(key, JSON.stringify(value), ttlSeconds);
    }
  }

  static async getJSON(key: string, path: string = '$'): Promise<any> {
    try {
      const client = this.getClient();
      return await (client as any).json.get(key, { path });
    } catch (error) {
      // Fallback to regular string storage
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    }
  }

  // Pub/Sub operations
  static async publish(channel: string, message: string): Promise<number> {
    const client = this.getClient();
    return await client.publish(channel, message);
  }

  static async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  }

  // Pattern matching
  static async keys(pattern: string): Promise<string[]> {
    const client = this.getClient();
    return await client.keys(pattern);
  }

  // Increment operations
  static async incr(key: string): Promise<number> {
    const client = this.getClient();
    return await client.incr(key);
  }

  static async incrBy(key: string, increment: number): Promise<number> {
    const client = this.getClient();
    return await client.incrBy(key, increment);
  }

  // TTL operations
  static async expire(key: string, seconds: number): Promise<boolean> {
    const client = this.getClient();
    return (await client.expire(key, seconds)) === 1;
  }

  static async ttl(key: string): Promise<number> {
    const client = this.getClient();
    return await client.ttl(key);
  }
}