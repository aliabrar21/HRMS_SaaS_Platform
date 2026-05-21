import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany();
  console.log('Organizations:', orgs.map(o => ({ id: o.id, name: o.name, slug: o.slug })));

  const roles = await prisma.role.findMany();
  console.log('Roles:', roles.map(r => ({ id: r.id, name: r.name, orgId: r.orgId })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
