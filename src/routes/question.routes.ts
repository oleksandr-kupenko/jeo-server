import express from 'express';
import {
  createQuestion,
  createQuestionRow,
  getQuestionRowsByGameId,
  updateQuestion,
  updateQuestionRowValue
} from '../controllers/questionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - categoryId
 *               - rowId
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               rowId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to create questions for this game
 *       404:
 *         description: Game not found
 */
router.post('/', authenticate, createQuestion);

/**
 * @swagger
 * /api/questions/rows:
 *   post:
 *     summary: Create a new question row
 *     tags: [Questions]
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
 *               - value
 *               - order
 *             properties:
 *               gameId:
 *                 type: string
 *               value:
 *                 type: number
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Question row created successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to create question rows for this game
 *       404:
 *         description: Game not found
 */
router.post('/rows', authenticate, createQuestionRow);

/**
 * @swagger
 * /api/questions/rows/game/{gameId}:
 *   get:
 *     summary: Get all question rows for a game
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of question rows
 *       404:
 *         description: Game not found
 */
router.get('/rows/game/:gameId', getQuestionRowsByGameId);

/**
 * @swagger
 * /api/questions/{id}:
 *   patch:
 *     summary: Update a question
 *     tags: [Questions]
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
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               rowId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this question
 *       404:
 *         description: Question not found
 */
router.patch('/:id', authenticate, updateQuestion);

/**
 * @swagger
 * /api/questions/rows/{id}:
 *   patch:
 *     summary: Update question row value
 *     tags: [Questions]
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
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Question row updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this question row
 *       404:
 *         description: Question row not found
 */
router.patch('/rows/:id', authenticate, updateQuestionRowValue);

export default router; 