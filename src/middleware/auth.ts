import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { SystemRole } from '@prisma/client';

interface JwtPayload {
  userId: string;
  role: SystemRole;
}

// Расширяем интерфейс Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: SystemRole;
      }
    }
  }
}

// Middleware для проверки аутентификации
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Invalid token format' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await prisma.user.findUnique({
      
      where: { id: decoded.userId }
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Добавляем пользователя в объект запроса
    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      next(error);
    }
  }
};

// Алиас для обратной совместимости, если этот метод используется где-то еще
export const authMiddleware = authenticate;

// Middleware для проверки роли админа
export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (user.role !== SystemRole.ADMIN) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Обновляем роль пользователя в объекте запроса
    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware для проверки авторизации доступа к профилю
export const isOwnerOrAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    if (req.user.id === req.params.userId || req.user.role === SystemRole.ADMIN) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    next(error);
  }
};