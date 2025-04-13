import { Router } from 'express';
import { 
  createGameSession, 
  getGameSessionById, 
  updateCurrentTurn, 
  markQuestionAnswered,
  getAllGameSessions,
  getGameSession,
  updateSessionQuestion,
  endGameSession
} from '../controllers/gameSessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/game-sessions:
 *   post:
 *     summary: Создать новую игровую сессию
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - name
 *             properties:
 *               gameId:
 *                 type: string
 *                 format: uuid
 *                 description: ID игры, для которой создается сессия
 *               name:
 *                 type: string
 *                 description: Название игровой сессии
 *               numberOfPlayers:
 *                 type: integer
 *                 minimum: 2
 *                 maximum: 10
 *                 default: 3
 *                 description: Количество игроков (от 2 до 10)
 *               numberOfAiPlayers:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 default: 0
 *                 description: Количество ИИ игроков (не более чем numberOfPlayers)
 *               defaultTimer:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 120
 *                 default: 30
 *                 description: Таймер по умолчанию для вопросов (от 5 до 120 секунд)
 *     responses:
 *       201:
 *         description: Успешно создана игровая сессия
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSession'
 *       400:
 *         description: Некорректные параметры запроса
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', authenticate, createGameSession);

/**
 * @swagger
 * /api/game-sessions:
 *   get:
 *     summary: Получить все игровые сессии
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех игровых сессий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameSession'
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.get('/', authenticate, getAllGameSessions);

/**
 * @swagger
 * /api/game-sessions/questions/{questionId}/answer:
 *   patch:
 *     summary: Отметить вопрос как отвеченный
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID вопроса в сессии
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
 *                 description: ID игрока, ответившего на вопрос
 *               isCorrect:
 *                 type: boolean
 *                 description: Правильный ли ответ
 *     responses:
 *       200:
 *         description: Вопрос успешно отмечен как отвеченный
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSessionQuestion'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Вопрос не найден
 *       500:
 *         description: Ошибка сервера
 */
router.patch('/questions/:questionId/answer', authenticate, markQuestionAnswered);

/**
 * @swagger
 * /api/game-sessions/games/{gameId}:
 *   get:
 *     summary: Получить активную сессию для игры
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID игры
 *     responses:
 *       200:
 *         description: Активная сессия игры
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSession'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/games/:gameId', authenticate, getGameSession);

/**
 * @swagger
 * /api/game-sessions/{id}:
 *   get:
 *     summary: Получить игровую сессию по ID
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID игровой сессии
 *     responses:
 *       200:
 *         description: Данные игровой сессии
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSession'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get('/:id', authenticate, getGameSessionById);

/**
 * @swagger
 * /api/game-sessions/{id}/current-turn:
 *   patch:
 *     summary: Обновить текущий ход в игровой сессии
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID игровой сессии
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentTurn
 *             properties:
 *               currentTurn:
 *                 type: string
 *                 format: uuid
 *                 description: ID игрока, чей сейчас ход
 *     responses:
 *       200:
 *         description: Ход успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSession'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав для обновления
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.patch('/:id/current-turn', authenticate, updateCurrentTurn);

/**
 * @swagger
 * /api/game-sessions/{id}/end:
 *   patch:
 *     summary: Завершить игровую сессию
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID игровой сессии
 *     responses:
 *       200:
 *         description: Сессия успешно завершена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSession'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Сессия не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.patch('/:id/end', authenticate, endGameSession);

/**
 * @swagger
 * /api/game-sessions/{sessionId}/questions/{questionId}:
 *   patch:
 *     summary: Обновить статус вопроса в сессии
 *     tags: [GameSessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID игровой сессии
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID вопроса
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRevealed:
 *                 type: boolean
 *               isAnswered:
 *                 type: boolean
 *               playerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Статус вопроса успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameSessionQuestion'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа к управлению сессией
 *       404:
 *         description: Сессия или вопрос не найдены
 *       500:
 *         description: Ошибка сервера
 */
router.patch('/:sessionId/questions/:questionId', authenticate, updateSessionQuestion);

export default router; 