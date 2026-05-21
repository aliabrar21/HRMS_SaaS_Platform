import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAttendanceLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const { month, year } = req.query;
    
    // Default to current month/year
    const d = new Date();
    const targetMonth = month ? parseInt(month as string) : d.getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : d.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const logs = await prisma.attendanceLog.findMany({
      where: {
        employee: { orgId: actualOrgId },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({ success: true, data: logs, message: 'Attendance logs retrieved' });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;
    const { employeeId, date } = req.query;

    if (!employeeId || !date) {
      return res.status(400).json({ success: false, message: 'Missing employeeId or date' });
    }

    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    const log = await prisma.attendanceLog.findFirst({
      where: {
        employeeId: employeeId as string,
        orgId: actualOrgId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        employee: {
          include: {
            department: true,
            designation: true,
            manager: true
          }
        },
        shift: true,
        breakLogs: true,
        geoFence: true
      }
    });

    const productivity = await prisma.productivityLog.findFirst({
      where: {
        employeeId: employeeId as string,
        orgId: actualOrgId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const screenshots = await prisma.productivityScreenshot.findMany({
      where: {
        employeeId: employeeId as string,
        orgId: actualOrgId,
        capturedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { capturedAt: 'asc' }
    });

    const activities = await prisma.productivityActivity.findMany({
      where: {
        employeeId: employeeId as string,
        orgId: actualOrgId,
        startedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { startedAt: 'asc' }
    });

    res.json({ 
      success: true, 
      data: { 
        log, 
        productivity, 
        screenshots, 
        activities 
      } 
    });
  } catch (error) {
    next(error);
  }
};
