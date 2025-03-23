import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from "./config/prisma";
import rolesRoutes from './routes/roles.routes';
import permissionsRoutes from './routes/permissions.routes';
import usersRoutes from './routes/users.routes';
import swaggerUi from 'swagger-ui-express';
import profileRoutes from './routes/profileRoutes';
import gameRoutes from './routes/gameRoutes';
import categoryRoutes from './routes/categoryRoutes';
import questionRoutes from './routes/questionRoutes';
import playerRoutes from './routes/playerRoutes';
import gameSessionRoutes from './routes/gameSessionRoutes';
import specs from './config/swagger';
import { authenticate } from './middleware/auth';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/roles', authenticate, rolesRoutes);
app.use('/api/permissions', authenticate, permissionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profiles', authenticate, profileRoutes);
app.use('/api/games', authenticate, gameRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/questions', authenticate, questionRoutes);
app.use('/api/players', authenticate, playerRoutes);
app.use('/api/game-sessions', authenticate, gameSessionRoutes);

const server = app.listen(port, () => {
    console.log(`⚡️[сервер]: Сервер запущен на http://localhost:${port}`);
    console.log(`Документация API доступна по адресу: http://localhost:${port}/api-docs`);
});

app.get('/', async (req: Request, res: Response) => {
    try {
        const result = 'HELLO WORLD';
        res.json({
            message: 'Сервер работает',
            timestamp: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка подключения к базе данных' });
    }
});

process.on('uncaughtException', (error) => {
    console.error('Необработанное исключение:', error);
    process.exit(1);
}); 

process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанное отклонение промиса:', promise, 'Причина:', reason);
});

// Обработка корректного закрытия приложения
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    server.close(() => {
        console.log('Сервер остановлен');
        process.exit(0);
    }); 
});

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});