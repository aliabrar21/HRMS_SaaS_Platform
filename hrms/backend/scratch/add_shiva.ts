import { PrismaClient, RoleName, EmploymentStatus, EmploymentCategory, WorkMode } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Loads from process.cwd() by default, which is backend/

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: 'acme' }
  });

  if (!org) {
    throw new Error('Organization "acme" not found. Please run seed script first.');
  }

  const employeeRole = await prisma.role.findFirst({
    where: { orgId: org.id, name: 'employee' }
  });

  if (!employeeRole) {
    throw new Error('Role "employee" not found.');
  }

  const email = 'shivaram33987@gmail.com';
  const firstName = 'shiva';
  const lastName = 'Admin';
  const password = 'Welcome@123';
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { orgId: org.id, email: email.toLowerCase() }
  });

  if (existingUser) {
    console.log('User already exists, updating password...');
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { passwordHash }
    });
    console.log('User password updated.');
    return;
  }

  // Create User
  const user = await prisma.user.create({
    data: {
      orgId: org.id,
      roleId: employeeRole.id,
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      isInviteAccepted: true,
      mfaEnabled: false,
    }
  });

  // Create Employee
  const employee = await prisma.employee.create({
    data: {
      orgId: org.id,
      userId: user.id,
      employeeCode: 'EMP-SHIVA-001',
      firstName,
      lastName,
      email: email.toLowerCase(),
      joinDate: new Date(),
      status: EmploymentStatus.ACTIVE,
      employmentCategory: EmploymentCategory.FULL_TIME,
      workMode: WorkMode.OFFICE,
    }
  });

  console.log(`Successfully created user and employee for ${firstName} (${email})`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
