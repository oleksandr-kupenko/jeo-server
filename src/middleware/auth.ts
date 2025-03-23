import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Тип для роли пользователя
type Role = string;

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: Role;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            role: Role;
        };

        req.user = decoded;
        next();
    } catch (error) {
        console.log(1);
        res.status(401).json({ error: 'Неверный токен' });
    }
};

export const authenticate = (
    req: AuthRequest, 
    res: Response, 
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;
        
        console.log('Auth Header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Invalid header format or missing');
            res.status(401).json({ message: 'Требуется авторизация' });
            return;
        }
        
        const token = authHeader.split(' ')[1];
        console.log('Token received:', token.substring(0, 10) + '...');
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
                userId: string;
                role: Role;
            };
            
            console.log('Token verified successfully, user:', decoded);
            req.user = decoded;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            console.log(2);
            res.status(401).json({ message: 'Неверный токен' });
            return;
        }
    } catch (error) {
        console.error('General error in authenticate middleware:', error);
        res.status(401).json({ message: 'Ошибка аутентификации' });
        return;
    }
};