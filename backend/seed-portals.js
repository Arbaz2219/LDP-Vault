const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Updating users...', users.length);
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        portals: user.role === 'ADMIN' ? ['vault', 'admin'] : ['vault']
      }
    });
    console.log(`Updated user ${user.email}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
