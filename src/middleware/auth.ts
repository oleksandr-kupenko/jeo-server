import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Расширяем интерфейс Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
      }
    }
  }
}

// Middleware для проверки аутентификации
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Требуется аутентификация' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

// Алиас для обратной совместимости, если этот метод используется где-то еще
export const authMiddleware = authenticate;

// Middleware для проверки роли админа
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authenticate(req, res, () => {
      if (req.user?.role !== Role.ADMIN) {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Middleware для проверки авторизации доступа к профилю
export const isAuthorizedForProfile = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.id === req.params.userId || req.user?.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ error: 'Нет прав для изменения этого профиля' });
  }
};