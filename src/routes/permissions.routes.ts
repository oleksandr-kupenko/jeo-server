import express from 'express';
import { createPermission, getPermissions } from '../controllers/permissions.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Permission already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createPermission);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions with their roles
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions with roles
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getPermissions);

export default router; 