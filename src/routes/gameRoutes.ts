import express from 'express';
import * as gameController from '../controllers/gameController';
import { isAuthenticated } from '../middleware/authMiddleware';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Создание новой игры
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Игра успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       401:
 *         description: Не авторизован
 */
router.post('/', isAuthenticated, gameController.createGame);

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Получение всех игр
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Список игр
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */
router.get('/', (req, res, next) => {
  console.log('Game controller reached, user:', req.user);
  next();
}, gameController.getAllGames);

/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Получение игры по ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID игры
 *     responses:
 *       200:
 *         description: Информация об игре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       404:
 *         description: Игра не найдена
 */
router.get('/:id', gameController.getGameById);

/**
 * @swagger
 * /games/{id}:
 *   put:
 *     summary: Обновление игры
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID игры
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Игра успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Игра не найдена
 */
router.put('/:id', isAuthenticated, gameController.updateGame);

/**
 * @swagger
 * /games/{id}:
 *   delete:
 *     summary: Удаление игры
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID игры
 *     responses:
 *       200:
 *         description: Игра успешно удалена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Игра не найдена
 */
router.delete('/:id', isAuthenticated, gameController.deleteGame);

export default router; 