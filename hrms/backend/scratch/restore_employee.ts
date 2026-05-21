import { PrismaClient, RoleName, EmploymentStatus, EmploymentCategory, WorkMode } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findFirst({ where: { slug: 'acme' } });
  if (!org) {
    console.error('Org acme not found');
    return;
  }

  const role = await prisma.role.findFirst({
    where: { orgId: org.id, name: 'it_admin' },
  });

  if (!role) {
    console.error('Role it_admin not found');
    return;
  }

  const department = await prisma.department.findFirst({
    where: { orgId: org.id, name: 'Operations' },
  });

  const designation = await prisma.designation.findFirst({
    where: { orgId: org.id, name: 'Operations Analyst' },
  });

  const defaultPasswordHash = await bcrypt.hash('Welcome@123', 12);

  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      roleId: role.id,
      email: 'vikram.gupta@acmepeople.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Vikram',
      lastName: 'Gupta',
      isInviteAccepted: true,
    },
  });

  const employee = await prisma.employee.create({
    data: {
      orgId: org.id,
      userId: user.id,
      employeeCode: 'EMP-2025-005',
      firstName: 'Vikram',
      lastName: 'Gupta',
      email: 'vikram.gupta@acmepeople.com',
      joinDate: new Date(),
      status: EmploymentStatus.ACTIVE,
      employmentCategory: EmploymentCategory.FULL_TIME,
      workMode: WorkMode.WFH,
      departmentId: department?.id,
      designationId: designation?.id,
    },
  });

  console.log(`Restored employee: Vikram Gupta (${employee.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
