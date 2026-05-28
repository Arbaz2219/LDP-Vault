const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Force updating help-desk user...');
  await prisma.user.update({
    where: { email: 'help-desk@ldplogistics.com' },
    data: {
      role: 'ADMIN',
      portals: ['vault', 'admin']
    }
  });
  console.log('Force update complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
