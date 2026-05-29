const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDelete() {
  // Create an item
  const item = await prisma.vaultItem.create({
    data: { name: 'Test Item Delete' }
  });
  console.log('Created item:', item.id);

  // Create a log for it
  await prisma.auditLog.create({
    data: {
      action: 'TEST',
      userId: (await prisma.user.findFirst()).id,
      itemId: item.id,
      details: 'Test log'
    }
  });
  console.log('Created log');

  // Try to delete via logic similar to the fixed route
  try {
    await prisma.auditLog.deleteMany({ where: { itemId: item.id } });
    await prisma.vaultItem.delete({ where: { id: item.id } });
    console.log('SUCCESS: Item deleted despite having logs');
  } catch (err) {
    console.error('FAILURE: Could not delete item:', err.message);
  }
}

testDelete()
  .finally(() => prisma.$disconnect());
