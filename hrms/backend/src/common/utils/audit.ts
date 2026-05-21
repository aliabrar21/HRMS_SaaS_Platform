import type { Request } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';

export const createAuditLog = async (params: {
  req: Request;
  action: string;
  module: string;
  entityName: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  orgId: string;
}): Promise<void> => {
  await prisma.auditLog.create({
    data: {
      orgId: params.orgId,
      userId: params.userId,
      action: params.action,
      module: params.module,
      entityName: params.entityName,
      entityId: params.entityId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: params.req.ip,
      userAgent: params.req.headers['user-agent'],
    },
  });
};
