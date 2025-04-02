import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получение всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 */
router.get('/', isAdmin, UsersController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получение пользователя по ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
router.get('/:id', authenticate, UsersController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Обновление пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Пользователь не найден
 */
router.put('/:id', authenticate, UsersController.updateUserProfile);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удаление пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удален
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет доступа
 *       404:
 *         description: Пользователь не найден
 */
router.delete('/:id', isAdmin, UsersController.deleteUser);

// Аутентификация
router.post('/login', UsersController.login);
router.post('/register', UsersController.register);

// Управление ролями (только для админов)
router.put('/:id/role', isAdmin, UsersController.assignRoleToUser);
router.get('/:id/roles', authenticate, UsersController.getUserRoles);

export default router; 