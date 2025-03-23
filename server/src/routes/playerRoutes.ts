import { Router } from 'express';
import { playerController } from '../controllers/playerController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

router.post('/', playerController.createPlayer);
router.get('/:id', playerController.getPlayerById);
router.get('/game/:gameId', playerController.getPlayersByGameId);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);
router.patch('/:id/points', playerController.updatePoints);

export const playerRoutes = router; 