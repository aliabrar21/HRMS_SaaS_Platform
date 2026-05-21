import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const documents = await prisma.document.findMany({
      where: { orgId: actualOrgId },
      include: {
        employee: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: documents, message: 'Documents retrieved' });
  } catch (error) {
    next(error);
  }
};
