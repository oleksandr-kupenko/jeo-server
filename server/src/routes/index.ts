import { Router } from 'express';
import { userRoutes } from './userRoutes';
import { gameRoutes } from './gameRoutes';
import { categoryRoutes } from './categoryRoutes';
import { questionRoutes } from './questionRoutes';
import { questionRowRoutes } from './questionRowRoutes';
import { gameSessionRoutes } from './gameSessionRoutes';
import { playerRoutes } from './playerRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/games', gameRoutes);
router.use('/categories', categoryRoutes);
router.use('/questions', questionRoutes);
router.use('/question-rows', questionRowRoutes);
router.use('/game-sessions', gameSessionRoutes);
router.use('/players', playerRoutes);

export const routes = router; 