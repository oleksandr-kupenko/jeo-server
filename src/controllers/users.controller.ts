import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class UsersController {
    // Метод для авторизации
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(401).json({ error: 'Пользователь не найден' });
            }
            
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Неверный пароль' });
            }
            
            const token = jwt.sign(
                { userId: user.id, role: user.role },
                process.env.JWT_SECRET!,
                { expiresIn: '24h' }
            );
            
            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name, 
                    role: user.role 
                } 
            });
        } catch (error) {
            res.status(400).json({ error: 'Ошибка при входе' });
        }
    }

    // Метод для назначения роли пользователю
    async assignRoleToUser(req: Request, res: Response) {
        try {
            const { userId, role } = req.body;
            
            // Проверка валидности роли
            if (!['ADMIN', 'USER', 'MODERATOR'].includes(role)) {
                return res.status(400).json({ error: 'Недопустимая роль' });
            }
            
            const updatedUser = await prisma.user.update({
                where: { id: userId },
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
            res.status(500).json({ error: 'Ошибка при назначении роли пользователю' });
        }
    }

    // Метод для получения ролей пользователя
    async getUserRoles(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    role: true
                }
            });
            
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            res.json({ userId: user.id, role: user.role });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении ролей пользователя' });
        }
    }

    // Метод для обновления профиля пользователя
    async updateUserProfile(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { name, email } = req.body;
            
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    name,
                    email
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при обновлении профиля пользователя' });
        }
    }

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

            res.json({ 
                token, 
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name, 
                    role: user.role 
                } 
            });
        } catch (error) {
            res.status(400).json({ error: 'Ошибка при регистрации' });
        }
    }
} 