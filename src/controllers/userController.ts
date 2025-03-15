import { Request, Response } from 'express';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

            res.json({ token });
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
                    res.json({ token });
                }
            }
        } catch (error) {
            res.status(400).json({ error: 'Ошибка при входе' });
        }
    }
};