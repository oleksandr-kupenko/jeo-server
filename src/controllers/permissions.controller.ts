import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class PermissionsController {
  // Создание разрешения
  async createPermission(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      
      const permission = await prisma.$queryRaw`
        INSERT INTO "Permission" (id, name, description)
        VALUES (gen_random_uuid(), ${name}, ${description})
        RETURNING *`;
      
      return res.status(201).json(permission[0]);
    } catch (error) {
      return res.status(500).json({ error: 'Не удалось создать разрешение' });
    }
  }
  
  // Получение всех разрешений
  async getPermissions(req: Request, res: Response) {
    try {
      const permissions = await prisma.$queryRaw`SELECT * FROM "Permission"`;
      
      return res.status(200).json(permissions);
    } catch (error) {
      return res.status(500).json({ error: 'Не удалось получить разрешения' });
    }
  }
} 