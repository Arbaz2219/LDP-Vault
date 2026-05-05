import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'help-desk@ldplogistics.com';
  const password = '123456';
  const name = 'LDP Super Admin';

  const hashedPassword = await bcrypt.hash(password, 10);

  const org = await prisma.organization.upsert({
    where: { id: 'ldp-org-id' }, // Fixed ID for seeding
    update: { name: 'LDP Logistics' },
    create: { id: 'ldp-org-id', name: 'LDP Logistics' },
  });

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      masterPasswordHash: hashedPassword,
      role: 'ADMIN',
      organizationId: org.id
    },
    create: {
      email,
      name,
      masterPasswordHash: hashedPassword,
      role: 'ADMIN',
      organizationId: org.id
    },
  });

  console.log(`Super Admin created: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
