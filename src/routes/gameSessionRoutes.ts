import express from 'express';
import { 
  createGameSession, 
  getGameSessionById, 
  getAllGameSessions,
  updateCurrentTurn,
  endGameSession
} from '../controllers/gameSessionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Удаляем глобальное использование middleware, т.к. есть проблемы с типами
// router.use(authenticate);

/**
 * @swagger
 * /api/game-sessions:
 *   post:
 *     summary: Создать новую игровую сессию
 *     tags: [GameSessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *             properties:
 *               gameId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Игровая сессия создана
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Серверная ошибка
 */
router.post('/', authenticate, createGameSession);

/**
 * @swagger
 * /api/game-sessions:
 *   get:
 *     summary: Получить все игровые сессии
 *     tags: [GameSessions]
 *     responses:
 *       200:
 *         description: Список игровых сессий
 *       500:
 *         description: Серверная ошибка
 */
router.get('/', authenticate, getAllGameSessions);

/**
 * @swagger
 * /api/game-sessions/{id}:
 *   get:
 *     summary: Получить игровую сессию по ID
 *     tags: [GameSessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Игровая сессия
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Серверная ошибка
 */
router.get('/:id', authenticate, getGameSessionById);

/**
 * @swagger
 * /api/game-sessions/{id}/current-turn:
 *   patch:
 *     summary: Обновить текущий ход в игровой сессии
 *     tags: [GameSessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Ход обновлен
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Серверная ошибка
 */
router.patch('/:id/current-turn', authenticate, updateCurrentTurn);

/**
 * @swagger
 * /api/game-sessions/{id}/end:
 *   patch:
 *     summary: Завершить игровую сессию
 *     tags: [GameSessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Сессия завершена
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Серверная ошибка
 */
router.patch('/:id/end', authenticate, endGameSession);

export default router; 