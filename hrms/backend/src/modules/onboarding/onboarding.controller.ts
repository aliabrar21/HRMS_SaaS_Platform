import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOnboardingTasks = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, data: [], message: 'Onboarding tasks retrieved' });
};
