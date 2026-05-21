import {
  AttendanceMode,
  AttendanceStatus,
  EmploymentCategory,
  EmploymentStatus,
  PayrollRunStatus,
  PrismaClient,
  RoleName,
  SalaryComponentType,
  SubscriptionPlan,
  WorkMode,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { eachDayOfInterval, endOfMonth, isWeekend, startOfMonth, subMonths } from 'date-fns';

const prisma = new PrismaClient();

const rolePermissionsMap: Record<RoleName, string[]> = {
  super_admin: ['*'],
  hr_admin: [
    'auth.invite',
    'employees.manage',
    'attendance.manage',
    'leave.manage',
    'payroll.manage',
    'documents.manage',
    'performance.manage',
  ],
  recruiter: ['recruitment.manage'],
  manager: ['attendance.team', 'leave.approve', 'performance.team'],
  employee: ['self.profile', 'self.leave', 'self.attendance', 'self.payslip'],
  finance: ['payroll.read', 'payroll.export', 'reimbursements.approve'],
  it_admin: ['assets.manage', 'users.provision'],
};

const departments = ['Human Resources', 'Engineering', 'Finance', 'Sales', 'Operations'];
const designations = ['HR Executive', 'Software Engineer', 'Accountant', 'Sales Executive', 'Operations Analyst'];

const firstNames = [
  'Arjun',
  'Priya',
  'Rohan',
  'Sneha',
  'Vikram',
  'Aditi',
  'Kabir',
  'Nisha',
  'Rahul',
  'Ananya',
  'Ishaan',
  'Meera',
  'Dev',
  'Kavya',
  'Aman',
  'Pooja',
  'Neel',
  'Riya',
  'Manav',
  'Tanya',
];

const lastNames = [
  'Sharma',
  'Verma',
  'Iyer',
  'Nair',
  'Gupta',
  'Rao',
  'Kapoor',
  'Sinha',
  'Mehta',
  'Jain',
  'Bose',
  'Patel',
  'Singh',
  'Malhotra',
  'Das',
  'Kulkarni',
  'Pillai',
  'Bhatt',
  'Mishra',
  'Agarwal',
];

const main = async () => {
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: 'acme' },
    select: { id: true },
  });

  if (existingOrg) {
    await prisma.organization.delete({
      where: { id: existingOrg.id },
    });
  }

  const org = await prisma.organization.create({
    data: {
      name: 'Acme People Pvt Ltd',
      slug: 'acme',
      subdomain: 'acme',
      plan: SubscriptionPlan.GROWTH,
      employeeLimit: 100,
      billingEmail: 'billing@acmepeople.com',
    },
  });

  const roleNames: RoleName[] = [
    'super_admin',
    'hr_admin',
    'recruiter',
    'manager',
    'employee',
    'finance',
    'it_admin',
  ];

  const permissionKeys = Array.from(new Set(Object.values(rolePermissionsMap).flat())).filter(
    (permission) => permission !== '*',
  );

  const permissions = await Promise.all(
    permissionKeys.map((key) =>
      prisma.permission.create({
        data: {
          orgId: org.id,
          key,
          description: key,
        },
      }),
    ),
  );

  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.role.create({
        data: {
          orgId: org.id,
          name,
          description: name,
        },
      }),
    ),
  );

  const roleMap = new Map<RoleName, (typeof roles)[number]>();
  for (const role of roles) {
    roleMap.set(role.name, role);
  }

  for (const role of roles) {
    const allowedKeys = rolePermissionsMap[role.name];
    const selectedPermissions = allowedKeys.includes('*')
      ? permissions
      : permissions.filter((permission) => allowedKeys.includes(permission.key));

    await prisma.rolePermission.createMany({
      data: selectedPermissions.map((permission) => ({
        orgId: org.id,
        roleId: role.id,
        permissionId: permission.id,
      })),
    });
  }

  const departmentRows = await Promise.all(
    departments.map((name, index) =>
      prisma.department.create({
        data: {
          orgId: org.id,
          name,
          code: `DPT-${index + 1}`,
        },
      }),
    ),
  );

  const designationRows = await Promise.all(
    designations.map((name, index) =>
      prisma.designation.create({
        data: {
          orgId: org.id,
          name,
          departmentId: departmentRows[index]?.id,
        },
      }),
    ),
  );

  const employmentTypes = await Promise.all(
    ['Full-time', 'Part-time', 'Contract', 'Intern'].map((name) =>
      prisma.employmentType.create({
        data: {
          orgId: org.id,
          name,
          description: `${name} employee`,
        },
      }),
    ),
  );

  const workLocations = await Promise.all(
    [
      { name: 'Hyderabad HQ', mode: WorkMode.OFFICE },
      { name: 'Remote India', mode: WorkMode.WFH },
      { name: 'Hybrid Hub', mode: WorkMode.HYBRID },
    ].map((location) =>
      prisma.workLocation.create({
        data: {
          orgId: org.id,
          name: location.name,
          mode: location.mode,
        },
      }),
    ),
  );

  const defaultPasswordHash = await bcrypt.hash('Welcome@123', 12);

  const seededEmployees: { id: string; userId: string }[] = [];

  for (let index = 0; index < 20; index += 1) {
    const firstName = firstNames[index] ?? `Emp${index + 1}`;
    const lastName = lastNames[index] ?? 'User';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@acmepeople.com`;

    const roleName: RoleName =
      index === 0
        ? 'hr_admin'
        : index === 1
          ? 'manager'
          : index === 2
            ? 'finance'
            : index === 3
              ? 'recruiter'
              : index === 4
                ? 'it_admin'
                : 'employee';

    const role = roleMap.get(roleName);
    if (!role) {
      throw new Error(`Role ${roleName} missing in seed map`);
    }

    const user = await prisma.user.create({
      data: {
        orgId: org.id,
        roleId: role.id,
        email,
        passwordHash: defaultPasswordHash,
        firstName,
        lastName,
        isInviteAccepted: true,
        mfaEnabled: roleName === 'hr_admin' || roleName === 'finance',
      },
    });

    const employee = await prisma.employee.create({
      data: {
        orgId: org.id,
        userId: user.id,
        employeeCode: `EMP-2025-${String(index + 1).padStart(3, '0')}`,
        firstName,
        lastName,
        email,
        joinDate: subMonths(new Date(), Math.floor(Math.random() * 24)),
        status: EmploymentStatus.ACTIVE,
        employmentCategory:
          index % 4 === 0
            ? EmploymentCategory.FULL_TIME
            : index % 4 === 1
              ? EmploymentCategory.PART_TIME
              : index % 4 === 2
                ? EmploymentCategory.CONTRACT
                : EmploymentCategory.INTERN,
        workMode:
          index % 3 === 0 ? WorkMode.OFFICE : index % 3 === 1 ? WorkMode.WFH : WorkMode.HYBRID,
        departmentId: departmentRows[index % departmentRows.length]?.id,
        designationId: designationRows[index % designationRows.length]?.id,
        employmentTypeId: employmentTypes[index % employmentTypes.length]?.id,
        workLocationId: workLocations[index % workLocations.length]?.id,
        ctcPaise: 4500000 + index * 250000,
      },
    });

    seededEmployees.push({ id: employee.id, userId: user.id });
  }

  const primaryManager = seededEmployees[1];
  if (primaryManager) {
    for (let i = 2; i < seededEmployees.length; i += 1) {
      await prisma.employee.update({
        where: { id: seededEmployees[i]!.id },
        data: { managerId: primaryManager.id },
      });
    }
  }

  const shift = await prisma.shift.create({
    data: {
      orgId: org.id,
      name: 'Morning',
      code: 'MORNING',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriodMins: 10,
    },
  });

  await prisma.shiftAssignment.createMany({
    data: seededEmployees.map((employee) => ({
      orgId: org.id,
      shiftId: shift.id,
      employeeId: employee.id,
      effectiveFrom: subMonths(new Date(), 3),
    })),
  });

  const leaveTypes = await Promise.all(
    [
      'Sick Leave',
      'Casual Leave',
      'Earned Leave',
      'Maternity',
      'Paternity',
      'Compensatory Off',
      'Loss of Pay',
    ].map((name) =>
      prisma.leaveType.create({
        data: {
          orgId: org.id,
          name,
          annualAllowance: name === 'Loss of Pay' ? 0 : 12,
          isPaid: name !== 'Loss of Pay',
        },
      }),
    ),
  );

  for (const employee of seededEmployees) {
    await prisma.leaveBalance.createMany({
      data: leaveTypes.map((leaveType) => ({
        orgId: org.id,
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        year: new Date().getUTCFullYear(),
        openingBalance: leaveType.name === 'Loss of Pay' ? 0 : 12,
        accrued: leaveType.name === 'Loss of Pay' ? 0 : 4.5,
        used: Math.round(Math.random() * 3),
        available: leaveType.name === 'Loss of Pay' ? 0 : 9,
      })),
    });
  }

  const salaryStructure = await prisma.salaryStructure.create({
    data: {
      orgId: org.id,
      name: 'Standard India Structure',
      description: 'Default salary structure with statutory components',
      effectiveFrom: subMonths(new Date(), 6),
    },
  });

  await prisma.salaryComponent.createMany({
    data: [
      {
        orgId: org.id,
        salaryStructureId: salaryStructure.id,
        name: 'Basic',
        type: SalaryComponentType.EARNING,
        percentage: 40,
        isTaxable: true,
      },
      {
        orgId: org.id,
        salaryStructureId: salaryStructure.id,
        name: 'HRA',
        type: SalaryComponentType.EARNING,
        percentage: 20,
        isTaxable: true,
      },
      {
        orgId: org.id,
        salaryStructureId: salaryStructure.id,
        name: 'Special Allowance',
        type: SalaryComponentType.EARNING,
        percentage: 25,
        isTaxable: true,
      },
      {
        orgId: org.id,
        salaryStructureId: salaryStructure.id,
        name: 'PF',
        type: SalaryComponentType.DEDUCTION,
        percentage: 12,
        isTaxable: false,
      },
      {
        orgId: org.id,
        salaryStructureId: salaryStructure.id,
        name: 'Professional Tax',
        type: SalaryComponentType.DEDUCTION,
        fixedAmountPaise: 20000,
        isTaxable: false,
      },
    ],
  });

  await prisma.employeeSalary.createMany({
    data: seededEmployees.map((employee, index) => ({
      orgId: org.id,
      employeeId: employee.id,
      salaryStructureId: salaryStructure.id,
      ctcPaise: 4500000 + index * 250000,
      effectiveFrom: subMonths(new Date(), 6),
    })),
  });

  const months = [subMonths(new Date(), 2), subMonths(new Date(), 1), new Date()];

  for (const monthDate of months) {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const workingDays = eachDayOfInterval({ start: monthStart, end: monthEnd }).filter(
      (day) => !isWeekend(day),
    );

    for (const employee of seededEmployees) {
      const logs = workingDays.map((day) => {
        const present = Math.random() > 0.08;
        const late = Math.random() > 0.85;
        const isoDate = day.toISOString().split('T')[0]!;

        return {
          orgId: org.id,
          employeeId: employee.id,
          shiftId: shift.id,
          date: new Date(`${isoDate}T00:00:00.000Z`),
          status: present
            ? late
              ? AttendanceStatus.LATE
              : AttendanceStatus.PRESENT
            : AttendanceStatus.ABSENT,
          mode: AttendanceMode.MANUAL,
          checkInAt: present ? new Date(`${isoDate}T09:${late ? '18' : '02'}:00.000Z`) : null,
          checkOutAt: present ? new Date(`${isoDate}T18:12:00.000Z`) : null,
          lateByMinutes: late ? 16 : 2,
          overtimeMinutes: present ? Math.floor(Math.random() * 30) : 0,
        };
      });

      await prisma.attendanceLog.createMany({
        data: logs,
      });
    }

    const payrollRun = await prisma.payrollRun.create({
      data: {
        orgId: org.id,
        month: monthDate.getUTCMonth() + 1,
        year: monthDate.getUTCFullYear(),
        status: PayrollRunStatus.FINALIZED,
        isLocked: true,
        processedAt: monthEnd,
      },
    });

    await prisma.payrollEntry.createMany({
      data: seededEmployees.map((employee, index) => {
        const grossPayPaise = Math.floor((4500000 + index * 250000) / 12);
        const pfEmployeePaise = Math.floor(grossPayPaise * 0.12 * 0.4);
        const deductions = pfEmployeePaise + 20000;

        return {
          orgId: org.id,
          payrollRunId: payrollRun.id,
          employeeId: employee.id,
          grossPayPaise,
          totalDeductionsPaise: deductions,
          netPayPaise: grossPayPaise - deductions,
          lopDays: Math.random() > 0.9 ? 1 : 0,
          workingDays: workingDays.length,
          paidDays: workingDays.length,
          overtimeMinutes: Math.floor(Math.random() * 120),
          pfEmployeePaise,
          pfEmployerPaise: pfEmployeePaise,
          esiEmployeePaise: 0,
          esiEmployerPaise: 0,
          professionalTaxPaise: 20000,
          tdsPaise: Math.floor(grossPayPaise * 0.08),
          components: {
            basic: Math.floor(grossPayPaise * 0.4),
            hra: Math.floor(grossPayPaise * 0.2),
            special: Math.floor(grossPayPaise * 0.25),
          },
        };
      }),
    });
  }

  // Default admin credentials for local dev:
  // HR Admin: arjun.sharma@acmepeople.com / Welcome@123
  // Manager: priya.verma@acmepeople.com / Welcome@123
  // Finance: rohan.iyer@acmepeople.com / Welcome@123
  console.log(
    'Seed complete: 5 departments, 20 employees, attendance and payroll history across 3 months.',
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
