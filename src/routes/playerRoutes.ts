import express from 'express';
import { 
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  deletePlayer,
  getPlayersByGameSession
} from '../controllers/playerController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Получить всех игроков
 *     tags: [Players]
 *     responses:
 *       200:
 *         description: Список игроков
 */
router.get('/', getAllPlayers);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Получить игрока по ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные игрока
 *       404:
 *         description: Игрок не найден
 */
router.get('/:id', getPlayerById);

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Создать нового игрока
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gameSessionId
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               gameSessionId:
 *                 type: string
 *                 format: uuid
 *               userId:
 *                 type: string
 *                 format: uuid
 *               role:
 *                 type: string
 *                 enum: [GAME_MASTER, CONTESTANT]
 *     responses:
 *       201:
 *         description: Игрок создан
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Серверная ошибка
 */
router.post('/', createPlayer);

/**
 * @swagger
 * /players/gameSession/{gameSessionId}:
 *   get:
 *     summary: Получить игроков для указанной игровой сессии
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: gameSessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Список игроков
 *       500:
 *         description: Серверная ошибка
 */
router.get('/gameSession/:gameSessionId', getPlayersByGameSession);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Обновить игрока
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 type: number
 *               role:
 *                 type: string
 *                 enum: [GAME_MASTER, CONTESTANT]
 *     responses:
 *       200:
 *         description: Игрок обновлен
 *       404:
 *         description: Игрок не найден
 */
router.put('/:id', updatePlayer);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Удалить игрока
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Игрок удален
 *       404:
 *         description: Игрок не найден
 */
router.delete('/:id', deletePlayer);

export default router; 