import express from 'express';
import { createRole, getRoles, assignPermissionToRole, removePermissionFromRole } from '../controllers/roles.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
 *         description: Role created successfully
 *       400:
 *         description: Role already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createRole);

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles with their permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles with permissions
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getRoles);

/**
 * @swagger
 * /api/roles/permissions:
 *   post:
 *     summary: Assign a permission to a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionId
 *             properties:
 *               roleId:
 *                 type: string
 *               permissionId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission assigned successfully
 *       400:
 *         description: Permission already assigned to role
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role or permission not found
 */
router.post('/permissions', authenticate, assignPermissionToRole);

/**
 * @swagger
 * /api/roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     summary: Remove a permission from a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permission removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role permission not found
 */
router.delete('/:roleId/permissions/:permissionId', authenticate, removePermissionFromRole);

export default router; 