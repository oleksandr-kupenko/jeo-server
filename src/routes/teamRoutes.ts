import express from 'express';
import * as teamController from '../controllers/teamController';
import { isAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Создание новой команды
 *     tags: [Teams]
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
 *               name:
 *                 type: string
 *             required:
 *               - gameId
 *               - name
 *     responses:
 *       201:
 *         description: Команда успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Игра не найдена
 */
router.post('/', isAuthenticated, teamController.createTeam);

/**
 * @swagger
 * /teams/game/{gameId}:
 *   get:
 *     summary: Получение всех команд игры
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID игры
 *     responses:
 *       200:
 *         description: Список команд
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */
router.get('/game/:gameId', teamController.getTeamsByGameId);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Обновление команды
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               points:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Команда успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Команда не найдена
 */
router.put('/:id', isAuthenticated, teamController.updateTeam);

/**
 * @swagger
 * /teams/{teamId}/members:
 *   post:
 *     summary: Добавление участника в команду
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [GAME_MASTER, PLAYER]
 *             required:
 *               - userId
 *     responses:
 *       201:
 *         description: Участник успешно добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamMember'
 *       400:
 *         description: Пользователь уже в команде
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Команда не найдена
 */
router.post('/:teamId/members', isAuthenticated, teamController.addTeamMember);

/**
 * @swagger
 * /teams/{teamId}/members/{memberId}:
 *   delete:
 *     summary: Удаление участника из команды
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID команды
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID участника
 *     responses:
 *       200:
 *         description: Участник успешно удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Участник не найден
 */
router.delete('/:teamId/members/:memberId', isAuthenticated, teamController.removeTeamMember);

export default router; 