import express from 'express';
import * as aiGameController from '../controllers/aiGameController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /ai-games/generate:
 *   post:
 *     summary: Создание новой игры с помощью AI
 *     tags: [AI Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 description: Общая тема игры
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив категорий для игры (от 2 до 10)
 *               details:
 *                 type: string
 *                 description: Дополнительные детали или требования для генерации
 *               exampleQuestions:
 *                 type: string
 *                 description: Примеры вопросов для лучшего понимания требуемого стиля
 *               allowImages:
 *                 type: boolean
 *                 description: Разрешить использование изображений
 *               allowVideos:
 *                 type: boolean
 *                 description: Разрешить использование видео
 *     responses:
 *       200:
 *         description: Запрос на генерацию игры принят
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 formData:
 *                   type: object
 *       400:
 *         description: Неверные параметры запроса
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Не авторизован
 */
router.post('/generate', authenticate, aiGameController.generateGame);

/**
 * @swagger
 * /ai-games/status/{id}:
 *   get:
 *     summary: Получение статуса генерации игры
 *     tags: [AI Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID задачи на генерацию игры
 *     responses:
 *       200:
 *         description: Статус генерации игры
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, processing, completed, failed]
 *                 message:
 *                   type: string
 *                 id:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Задача на генерацию не найдена
 */
router.get('/status/:id', authenticate, aiGameController.getGameGenerationStatus);

export default router; 