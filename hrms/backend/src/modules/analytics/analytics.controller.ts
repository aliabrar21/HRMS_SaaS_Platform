import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalyticsData = async (req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, data: { headcount: 20, attrition: 5 }, message: 'Analytics data retrieved' });
};
