import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const createLeaveSchema = z.object({
  leaveTypeId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(1, 'Reason is required'),
});

export const getLeaveRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const leaves = await prisma.leaveApplication.findMany({
      where: { orgId: actualOrgId },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeCode: true } },
        leaveType: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const createLeaveRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    // For mock testing, assign to first employee
    const employee = await prisma.employee.findFirst({ where: { orgId: actualOrgId } });
    
    if (!employee) {
      return res.status(400).json({ success: false, message: 'No employee found to assign leave' });
    }

    const validatedData = createLeaveSchema.parse(req.body);

    const leave = await prisma.leaveApplication.create({
      data: {
        employeeId: employee.id,
        leaveTypeId: validatedData.leaveTypeId,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        reason: validatedData.reason,
        status: 'PENDING',
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        leaveType: { select: { name: true } }
      }
    });

    res.status(201).json({ success: true, data: leave, message: 'Leave applied successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', data: error.errors });
    }
    next(error);
  }
};

export const getLeaveTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await prisma.leaveType.findMany();
    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
}

export const getLeaveAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const currentYear = new Date().getUTCFullYear();

    // 1. Fetch Leave Types with Aggregated Balances
    const leaveTypes = await prisma.leaveType.findMany({
      where: { orgId: actualOrgId },
      include: {
        balances: {
          where: { year: currentYear }
        }
      }
    });

    // 2. Format Card Data
    const analytics = leaveTypes.map(type => {
      const totalAllocated = type.balances.reduce((acc, b) => acc + (b.openingBalance + b.accrued), 0);
      const totalUsed = type.balances.reduce((acc, b) => acc + b.used, 0);
      
      return {
        id: type.id,
        label: type.name,
        total: totalAllocated,
        used: totalUsed,
        color: type.name.toLowerCase().includes('sick') ? '#ef4444' : 
               type.name.toLowerCase().includes('casual') ? '#f59e0b' : 
               type.name.toLowerCase().includes('earned') ? '#3b82f6' : '#6366f1'
      };
    });

    // 3. Fetch Top Employee Usage for each type
    const employeeUsage: Record<string, any[]> = {};
    for (const type of leaveTypes) {
      const topBalances = await prisma.leaveBalance.findMany({
        where: { leaveTypeId: type.id, year: currentYear },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } }
            }
          }
        },
        orderBy: { used: 'desc' },
        take: 10
      });

      employeeUsage[type.id] = topBalances.map(b => ({
        id: b.employee.id,
        name: `${b.employee.firstName} ${b.employee.lastName}`,
        avatar: b.employee.firstName[0] + b.employee.lastName[0],
        department: b.employee.department?.name || 'General',
        used: b.used,
        remaining: b.available,
        lastTaken: 'N/A', // Would need LeaveApplication query for exact date
        status: 'ACTIVE'
      }));
    }

    // 4. Calculate Monthly Trends (Used Leaves)
    const monthlyApplications = await prisma.leaveApplication.findMany({
      where: { 
        orgId: actualOrgId,
        status: 'APPROVED',
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      },
      select: {
        createdAt: true,
        totalDays: true
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = months.map((month, index) => {
      const used = monthlyApplications
        .filter(app => app.createdAt.getUTCMonth() === index)
        .reduce((sum, app) => sum + app.totalDays, 0);
      
      return {
        month,
        used,
        earned: leaveTypes.reduce((acc, t) => acc + (t.balances[0]?.accrued || 0) / 12, 0) // Average earned
      };
    });

    res.json({ 
      success: true, 
      data: {
        cards: analytics,
        employeeUsage: employeeUsage,
        trends: trends
      } 
    });
  } catch (error) {
    next(error);
  }
};
export const updateLeaveStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updated = await prisma.leaveApplication.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
