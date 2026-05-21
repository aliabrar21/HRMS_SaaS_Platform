import type { NextFunction, Request, Response } from 'express';
import type { RoleName } from '@hrms/shared';
import { prisma } from '../../config/prisma.js';
import { sendError } from '../utils/api-response.js';

export const requireRoles = (roles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    if (!roles.includes(req.auth.role)) {
      sendError(res, 'Forbidden: insufficient role', 403);
      return;
    }

    next();
  };
};

export const requirePermissions = (permissionKeys: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.auth) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const role = await prisma.role.findFirst({
      where: {
        orgId: req.auth.orgId,
        name: req.auth.role,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const granted = new Set(role?.rolePermissions.map((rp) => rp.permission.key) ?? []);
    const allowed = permissionKeys.every((key) => granted.has(key));

    if (!allowed) {
      sendError(res, 'Forbidden: missing permissions', 403);
      return;
    }

    next();
  };
};
