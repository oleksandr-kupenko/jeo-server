import { authenticate } from '../middleware/auth';
import { isAdmin, isAuthorizedForProfile } from '../middleware/auth';

// И в коде заменить все вызовы isAuthenticated на authenticate 