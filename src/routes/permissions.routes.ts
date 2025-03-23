import { Router } from 'express';
import { PermissionsController } from '../controllers/permissions.controller';

const router = Router();
const permissionsController = new PermissionsController();

router.post('/', (req, res) => permissionsController.createPermission(req, res));
router.get('/', (req, res) => permissionsController.getPermissions(req, res));

export default router; 