import express from 'express';
import * as profileController from '../controllers/profileController';
import { isAuthenticated, isAuthorizedForProfile } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /profiles/{userId}:
 *   get:
 *     summary: Получение профиля пользователя
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: Профиль не найден
 */
router.get('/:userId', profileController.getProfile);

/**
 * @swagger
 * /profiles/{userId}:
 *   put:
 *     summary: Обновление профиля пользователя
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Профиль успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 */
router.put('/:userId', isAuthenticated, isAuthorizedForProfile, profileController.updateProfile);

/**
 * @swagger
 * /profiles/{userId}/stats:
 *   put:
 *     summary: Обновление статистики игрока
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gamesPlayed:
 *                 type: integer
 *               gamesWon:
 *                 type: integer
 *               rating:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Статистика успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Профиль не найден
 */
router.put('/:userId/stats', isAuthenticated, isAuthorizedForProfile, profileController.updateStats);

export default router; 