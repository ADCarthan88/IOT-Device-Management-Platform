import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || []
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token has expired');
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      } else {
        throw new UnauthorizedError('Token verification failed');
      }
    }
  } catch (error) {
    next(error);
  }
};

// Optional auth middleware - doesn't throw error if no token
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
          req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions || []
          };
        } catch (jwtError) {
          // Silently ignore invalid tokens in optional auth
        }
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based access control
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }

    next();
  };
};

// Permission-based access control
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!req.user.permissions.includes(permission)) {
      throw new UnauthorizedError(`Permission '${permission}' required`);
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole('admin');

// Superuser only middleware
export const requireSuperuser = requireRole('superuser');