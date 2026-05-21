import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const courses = await prisma.course.findMany({
      where: { orgId: actualOrgId },
      include: {
        _count: { select: { enrollments: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: courses, message: 'Courses retrieved' });
  } catch (error) {
    next(error);
  }
};
