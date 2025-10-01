import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { logger } from '../utils/logger';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { RedisService } from '../services/RedisService';
// import { UserService } from '../services/UserService'; // Will be implemented later
// import { EmailService } from '../services/EmailService'; // Will be implemented later

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password, firstName, lastName, organizationName }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      throw new ValidationError('Email, password, first name, and last name are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    try {
      // Check if user already exists (mock implementation)
      const existingUser = await AuthController.findUserByEmail(email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user (mock implementation)
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email.toLowerCase(),
        firstName,
        lastName,
        role: 'user',
        isActive: true,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store user in Redis (temporary - would be database in real implementation)
      await RedisService.setJSON(`user:${newUser.id}`, '$', newUser);
      await RedisService.set(`user:email:${email.toLowerCase()}`, newUser.id);

      // Generate tokens
      const { accessToken, refreshToken } = AuthController.generateTokens(newUser);

      // Store refresh token in Redis
      await RedisService.set(`refresh_token:${newUser.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      logger.info(`User registered successfully: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            isActive: newUser.isActive,
            isEmailVerified: newUser.isEmailVerified,
            createdAt: newUser.createdAt
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    try {
      // Find user
      const user = await AuthController.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('Account is disabled');
      }

      // Get user's password hash (mock implementation)
      const passwordHash = await RedisService.get(`user:${user.id}:password`);
      if (!passwordHash) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate tokens
      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      // Store refresh token
      await RedisService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

      // Update last login
      user.updatedAt = new Date();
      await RedisService.setJSON(`user:${user.id}`, '$', user);

      logger.info(`User logged in successfully: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
      
      // Check if refresh token exists in Redis
      const storedToken = await RedisService.get(`refresh_token:${decoded.id}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Get user
      const user = await AuthController.findUserById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = AuthController.generateTokens(user);

      // Update refresh token in Redis
      await RedisService.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.user) {
        // Remove refresh token from Redis
        await RedisService.del(`refresh_token:${req.user.id}`);
        logger.info(`User logged out: ${req.user.email}`);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    try {
      const user = await AuthController.findUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, type: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // Store reset token in Redis
      await RedisService.set(`reset_token:${user.id}`, resetToken, 60 * 60); // 1 hour

      // TODO: Send email with reset link
      logger.info(`Password reset requested for: ${email}`);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ValidationError('Token and new password are required');
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    try {
      // Verify reset token
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new UnauthorizedError('Invalid reset token');
      }

      // Check if token exists in Redis
      const storedToken = await RedisService.get(`reset_token:${decoded.id}`);
      if (!storedToken || storedToken !== token) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }

      // Get user
      const user = await AuthController.findUserById(decoded.id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update password
      await RedisService.set(`user:${user.id}:password`, hashedPassword);

      // Remove reset token
      await RedisService.del(`reset_token:${decoded.id}`);

      // Invalidate all refresh tokens for this user
      await RedisService.del(`refresh_token:${user.id}`);

      logger.info(`Password reset successfully for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      if (decoded.type !== 'email_verification') {
        throw new UnauthorizedError('Invalid verification token');
      }

      // Get user
      const user = await AuthController.findUserById(decoded.id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Update user email verification status
      user.isEmailVerified = true;
      user.updatedAt = new Date();
      await RedisService.setJSON(`user:${user.id}`, '$', user);

      logger.info(`Email verified for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid or expired verification token');
      }
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    try {
      const user = await AuthController.findUserByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.isEmailVerified) {
        res.json({
          success: true,
          message: 'Email is already verified'
        });
        return;
      }

      // Generate verification token
      const verificationToken = jwt.sign(
        { id: user.id, type: 'email_verification' },
        config.jwt.secret,
        { expiresIn: '24h' }
      );

      // TODO: Send verification email
      logger.info(`Email verification resent for: ${email}`);

      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }

  // Helper methods
  private static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: [] // TODO: Add user permissions
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
  }

  private static async findUserByEmail(email: string): Promise<User | null> {
    try {
      const userId = await RedisService.get(`user:email:${email.toLowerCase()}`);
      if (!userId) return null;

      const user = await RedisService.getJSON(`user:${userId}`, '$');
      return user as User;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      return null;
    }
  }

  private static async findUserById(id: string): Promise<User | null> {
    try {
      const user = await RedisService.getJSON(`user:${id}`, '$');
      return user as User;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      return null;
    }
  }
}