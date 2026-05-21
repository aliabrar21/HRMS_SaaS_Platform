import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const candidates = await prisma.candidate.findMany({
      where: { orgId: actualOrgId },
      include: {
        jobPosting: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: candidates, message: 'Candidates retrieved' });
  } catch (error) {
    next(error);
  }
};
