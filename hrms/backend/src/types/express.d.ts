import type { RoleName } from '@hrms/shared';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        orgId: string;
        role: RoleName;
        email: string;
      };
      tenant?: {
        orgId: string;
        slug: string;
      };
    }
  }
}

export {};
