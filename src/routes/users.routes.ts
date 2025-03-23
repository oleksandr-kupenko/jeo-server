import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';

const router = Router();
const usersController = new UsersController();

// Добавляем маршрут для регистрации
router.post('/register', usersController.register.bind(usersController));
router.post('/login', usersController.login.bind(usersController));
router.post('/roles', usersController.assignRoleToUser.bind(usersController));
router.get('/:userId/roles', usersController.getUserRoles.bind(usersController));
router.put('/:userId/profile', usersController.updateUserProfile.bind(usersController));

// Если были дополнительные маршруты в userRoutes.ts, добавь их сюда
// Например:
// router.get('/', usersController.getAllUsers.bind(usersController));
// router.get('/:id', usersController.getUserById.bind(usersController));
// ... и т.д.

export default router; 