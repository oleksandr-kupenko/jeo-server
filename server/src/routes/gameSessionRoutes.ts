import express from 'express';
import gameSessionController from '../controllers/gameSessionController';

const router = express.Router();

router.post('/answer-question', gameSessionController.answerQuestion);

export default router; 