import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for validating employee creation
const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  joinDate: z.string().datetime(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  employmentCategory: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  workMode: z.enum(['OFFICE', 'WFH', 'HYBRID']),
  ctcPaise: z.number().int().nonnegative().optional(),
});

export const getEmployees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId; // Assuming auth middleware attaches user
    
    // Fallback for local development if auth is bypassed for testing
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const employees = await prisma.employee.findMany({
      where: { orgId: actualOrgId, isDeleted: false },
      include: {
        department: { select: { name: true } },
        designation: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: employees, message: 'Employees retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    if (!actualOrgId) {
      return res.status(400).json({ success: false, message: 'Organization not found' });
    }

    const validatedData = createEmployeeSchema.parse(req.body);

    // Check if employee code or email already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        orgId: actualOrgId,
        OR: [
          { employeeCode: validatedData.employeeCode },
          { email: validatedData.email }
        ]
      }
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee with this email or code already exists' 
      });
    }

    const employee = await prisma.employee.create({
      data: {
        orgId: actualOrgId,
        ...validatedData,
      },
      include: {
        department: { select: { name: true } },
        designation: { select: { name: true } },
      }
    });

    res.status(201).json({ success: true, data: employee, message: 'Employee created successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', data: error.errors });
    }
    next(error);
  }
};

export const getDepartments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;
    const departments = await prisma.department.findMany({ where: { orgId: actualOrgId } });
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const getDesignations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;
    const designations = await prisma.designation.findMany({ where: { orgId: actualOrgId } });
    res.json({ success: true, data: designations });
  } catch (error) {
    next(error);
  }
};

export const getEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    const employee = await prisma.employee.findFirst({
      where: { id, orgId: actualOrgId, isDeleted: false },
      include: {
        department: true,
        designation: true,
      }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).user?.orgId;
    const actualOrgId = orgId || (await prisma.organization.findFirst())?.id;

    const { firstName, lastName, email, workMode } = req.body;

    const employee = await prisma.employee.update({
      where: { id, orgId: actualOrgId },
      data: { firstName, lastName, email, workMode }
    });

    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};
