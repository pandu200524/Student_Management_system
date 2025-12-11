import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};