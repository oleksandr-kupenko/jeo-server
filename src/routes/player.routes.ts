import express from 'express';
import { 
  getAllPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  getPlayersBySessionId,
  deletePlayer,
} from '../controllers/playerController';
import { authenticate } from '../middleware/auth';
import { Request, Response } from 'express';

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
 *     summary: Create a new player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameSessionId
 *               - name
 *             properties:
 *               gameSessionId:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Player created successfully
 *       400:
 *         description: User is already a player in this session
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Game session not found
 */
router.post('/', authenticate, createPlayer);

/**
 * @swagger
 * /players/session/{gameSessionId}:
 *   get:
 *     summary: Get all players in a game session
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameSessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of players in the session
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Game session not found
 */
router.get('/session/:gameSessionId', authenticate, getPlayersBySessionId);

/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Player updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this player
 *       404:
 *         description: Player not found
 */
router.put('/:id', authenticate, updatePlayer);

/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     summary: Remove a player
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Player removed successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to remove this player
 *       404:
 *         description: Player not found
 */
router.delete('/:id', authenticate, deletePlayer);

export default router; 