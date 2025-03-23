import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export class RolesController {
  // Создание роли
  async createRole(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      
      const role = await prisma.role.create({
        data: {
          name,
          description
        }
      });
      
      return res.status(201).json(role);
    } catch (error) {
      return res.status(500).json({ error: 'Не удалось создать роль' });
    }
  }
  
  // Получение всех ролей
  async getRoles(req: Request, res: Response) {
    try {
      const roles = await prisma.$queryRaw`
        SELECT r.*, json_agg(
          json_build_object(
            'id', rp.id,
            'permission', (SELECT json_build_object('id', p.id, 'name', p.name, 'description', p.description) FROM "Permission" p WHERE p.id = rp."permissionId")
          )
        ) as "rolePermissions"
        FROM "Role" r
        LEFT JOIN "RolePermission" rp ON r.id = rp."roleId"
        GROUP BY r.id`;
      
      return res.status(200).json(roles);
    } catch (error) {
      return res.status(500).json({ error: 'Не удалось получить роли' });
    }
  }
  
  // Назначение разрешений роли
  async assignPermissionToRole(req: Request, res: Response) {
    try {
      const { roleId, permissionId } = req.body;
      
      const rolePermission = await prisma.$queryRaw`
        INSERT INTO "RolePermission" (id, "roleId", "permissionId")
        VALUES (gen_random_uuid(), ${roleId}, ${permissionId})
        RETURNING *`;
      
      const role = await prisma.$queryRaw`SELECT * FROM "Role" WHERE id = ${roleId}`;
      const permission = await prisma.$queryRaw`SELECT * FROM "Permission" WHERE id = ${permissionId}`;
      
      return res.status(201).json({
        ...rolePermission[0],
        role: role[0],
        permission: permission[0]
      });
    } catch (error) {
      return res.status(500).json({ error: 'Не удалось назначить разрешение' });
    }
  }
} 