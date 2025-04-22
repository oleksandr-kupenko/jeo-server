import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from "../config/prisma";

// Создание новой роли
export const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;

    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      res.status(400).json({ message: 'Role already exists' });
      return;
    }

    const role = await prisma.role.create({
      data: {
        name,
        description
      }
    });

    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
};

// Получение всех ролей с их разрешениями
export const getRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    res.json(roles);
  } catch (error) {
    next(error);
  }
};

// Назначение разрешения роли
export const assignPermissionToRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId, permissionId } = req.body;

    // Проверяем существование роли и разрешения
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId }
    });

    if (!role || !permission) {
      res.status(404).json({ message: 'Role or permission not found' });
      return;
    }

    // Проверяем, не назначено ли уже это разрешение роли
    const existingAssignment = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId
      }
    });

    if (existingAssignment) {
      res.status(400).json({ message: 'Permission already assigned to role' });
      return;
    }

    // Создаем связь между ролью и разрешением
    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId
      }
    });

    res.status(201).json(rolePermission);
  } catch (error) {
    next(error);
  }
};

// Удаление разрешения из роли
export const removePermissionFromRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roleId, permissionId } = req.params;

    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId
      }
    });

    if (!rolePermission) {
      res.status(404).json({ message: 'Role permission not found' });
      return;
    }

    await prisma.rolePermission.delete({
      where: {
        id: rolePermission.id
      }
    });

    res.status(200).json({ message: 'Permission removed from role' });
  } catch (error) {
    next(error);
  }
}; 