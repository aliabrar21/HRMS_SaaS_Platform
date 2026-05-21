import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'shiva', mode: 'insensitive' } },
        { lastName: { contains: 'shiva', mode: 'insensitive' } },
        { firstName: { contains: 'prasad', mode: 'insensitive' } },
        { lastName: { contains: 'prasad', mode: 'insensitive' } },
      ],
    },
    include: {
      user: true,
    },
  });

  if (employee) {
    console.log(`Found employee: ${employee.firstName} ${employee.lastName} (${employee.id})`);
    
    // Delete related records first if necessary, but Prisma might handle it with cascading
    // Check for related records like attendance, payroll, etc.
    
    await prisma.attendanceLog.deleteMany({ where: { employeeId: employee.id } });
    await prisma.leaveBalance.deleteMany({ where: { employeeId: employee.id } });
    await prisma.employeeSalary.deleteMany({ where: { employeeId: employee.id } });
    await prisma.shiftAssignment.deleteMany({ where: { employeeId: employee.id } });
    await prisma.payrollEntry.deleteMany({ where: { employeeId: employee.id } });
    
    await prisma.employee.delete({
      where: { id: employee.id },
    });

    if (employee.userId) {
      await prisma.user.delete({
        where: { id: employee.userId },
      });
    }

    console.log('Employee record and associated user deleted successfully.');
  } else {
    console.log('Employee "k shiva prasad" not found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
