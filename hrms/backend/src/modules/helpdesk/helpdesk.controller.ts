import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const tickets = await prisma.ticket.findMany({
      where: { employee: { orgId: actualOrgId } },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        assignee: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: tickets, message: 'Tickets retrieved' });
  } catch (error) {
    next(error);
  }
};
