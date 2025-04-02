import { SystemRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: SystemRole;
    }
  }
} 