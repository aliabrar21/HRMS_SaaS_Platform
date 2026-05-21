/**
 * Dev utility: disable MFA for roles that don't require it,
 * so login works without email OTP when SMTP is not configured.
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // Only hr_admin, finance, super_admin should require MFA
  const mfaNotRequired = ['employee', 'manager', 'recruiter', 'it_admin'];

  const roles = await prisma.role.findMany({
    where: { name: { in: mfaNotRequired } },
    select: { id: true, name: true },
  });

  for (const role of roles) {
    const updated = await prisma.user.updateMany({
      where: { roleId: role.id },
      data: { mfaEnabled: false },
    });
    console.log(`Disabled MFA for ${updated.count} users with role: ${role.name}`);
  }

  console.log('Done. Users with employee/manager/recruiter/it_admin roles can now log in without OTP.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
