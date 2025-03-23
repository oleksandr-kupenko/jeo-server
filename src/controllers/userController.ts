import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const userController = {
    async register(req: Request, res: Response) {
        try {
            const { email, name, password, role } = req.body;

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    role
                }
            });

            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '24h' }
            );

            res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
        } catch (error) {
            res.status(400).json({ error: 'Ошибка при регистрации' });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                res.status(401).json({ error: 'Пользователь не найден' });
            } else {
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    res.status(401).json({ error: 'Неверный пароль' });
                } else {
                    const token = jwt.sign(
                        { userId: user.id, role: user.role },
                        process.env.JWT_SECRET!,
                        { expiresIn: '24h' }
                    );
                    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
                } 
            }
        } catch (error) {
            res.status(400).json({ error: 'Ошибка при входе' });
        }
    }
};

// Получение всех пользователей
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profiles: true
      }
    });
    
    // Убираем пароли из ответа
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

// Получение пользователя по ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profiles: true,
        teams: {
          include: {
            team: true
          }
        },
        createdGames: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Убираем пароль из ответа
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении пользователя' });
  }
};

// Обновление роли пользователя (только для админов)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Проверка валидности роли
    if (!['ADMIN', 'USER', 'MODERATOR'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении роли пользователя' });
  }
};

// Удаление пользователя
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Сначала удаляем профиль
    await prisma.userProfile.deleteMany({
      where: { userId: id }
    });
    
    // Затем удаляем пользователя
    await prisma.user.delete({
      where: { id }
    });
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
};