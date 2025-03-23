import { Router } from 'express';
import { RolesController } from '../controllers/roles.controller';

const router = Router();
const rolesController = new RolesController();

router.post('/', (req, res) => rolesController.createRole(req, res));
router.get('/', (req, res) => rolesController.getRoles(req, res));
router.post('/permissions', (req, res) => rolesController.assignPermissionToRole(req, res));

export default router; 