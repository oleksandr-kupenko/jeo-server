import { Router } from 'express';
import { createGameSession, getGameSessionById, updateCurrentTurn, markQuestionAnswered } from '../controllers/gameSessionController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Создание новой игровой сессии
router.post('/', authenticate, createGameSession);

// Получение игровой сессии по ID
router.get('/:id', authenticate, getGameSessionById);

// Обновление текущего хода
router.patch('/:id/current-turn', authenticate, updateCurrentTurn);

// Отметить вопрос как отвеченный
router.patch('/questions/:questionId/answer', authenticate, markQuestionAnswered);

export default router; 