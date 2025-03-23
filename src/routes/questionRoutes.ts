import express from 'express';
import * as questionController from '../controllers/questionController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /questions/rows:
 *   post:
 *     summary: Создание нового ряда вопросов
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameId:
 *                 type: string
 *               value:
 *                 type: integer
 *               order:
 *                 type: integer
 *             required:
 *               - gameId
 *               - value
 *               - order
 *     responses:
 *       201:
 *         description: Ряд вопросов успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionRow'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Игра не найдена
 */
router.post('/rows', authenticate, questionController.createQuestionRow);

/**
 * @swagger
 * /questions/rows/game/{gameId}:
 *   get:
 *     summary: Получение всех рядов вопросов игры
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID игры
 *     responses:
 *       200:
 *         description: Список рядов вопросов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuestionRow'
 */
router.get('/rows/game/:gameId', questionController.getQuestionRowsByGameId);

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Создание нового вопроса
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               rowId:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *             required:
 *               - categoryId
 *               - rowId
 *               - question
 *               - answer
 *     responses:
 *       201:
 *         description: Вопрос успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Категория или ряд не найдены
 */
router.post('/', authenticate, questionController.createQuestion);

/**
 * @swagger
 * /questions/game/{gameId}:
 *   get:
 *     summary: Получение всех вопросов игры
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID игры
 *     responses:
 *       200:
 *         description: Список вопросов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get('/game/:gameId', questionController.getQuestionsByGameId);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Обновление вопроса
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID вопроса
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Вопрос успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Вопрос не найден
 */
router.put('/:id', authenticate, questionController.updateQuestion);

export default router; 