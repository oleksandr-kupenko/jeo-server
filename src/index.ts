import express, {Request, Response} from 'express';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';
import prisma from './config/prisma';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/users', userRoutes);

const server = app.listen(port, () => {
    console.log(`⚡️[сервер]: Сервер запущен на http://localhost:${port}`);
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

// Обработка корректного закрытия приложения
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    server.close(() => {
        console.log('Сервер остановлен');
        process.exit(0);
    });
});