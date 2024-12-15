// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const protect = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
      return; 
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      const user = await User.findById((decoded as any).userId).select('-password');
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;  
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
      return;  
    }
  } catch (error) {
    next(error);  
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;  
    }
    next();
  };
};