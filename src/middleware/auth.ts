import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен' });
    }
};