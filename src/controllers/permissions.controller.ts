import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

// Создание нового разрешения
export const createPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;

    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    });

    if (existingPermission) {
      res.status(400).json({ message: 'Permission already exists' });
      return;
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(permission);
  } catch (error) {
    next(error);
  }
};

// Получение всех разрешений
export const getPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    res.json(permissions);
  } catch (error) {
    next(error);
  }
}; 