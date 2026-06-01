const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n--- LDP VAULT DATABASE VIEW ---\n');

  console.log('USERS:');
  const users = await prisma.user.findMany({
    include: {
      organization: true,
    }
  });

  console.table(users.map(u => ({
    ID: u.id.substring(0, 8) + '...',
    Name: u.name,
    Email: u.email,
    Role: u.role,
    Org: u.organization?.name || 'N/A',
    Portals: u.portals.join(', ')
  })));

  console.log('\nVAULT ITEMS:');
  const items = await prisma.vaultItem.findMany({
    include: {
      user: true
    }
  });

  console.table(items.map(i => ({
    ID: i.id.substring(0, 8) + '...',
    Name: i.name,
    Type: i.type,
    User: i.user?.email || 'Global/Admin',
    URL: i.url || 'N/A'
  })));

  console.log('\nRECENT AUDIT LOGS:');
  const logs = await prisma.auditLog.findMany({
    take: 20,
    orderBy: { timestamp: 'desc' },
    include: {
      user: { select: { name: true } },
      item: { select: { name: true } }
    }
  });

  console.table(logs.map(l => ({
    Timestamp: l.timestamp.toISOString(),
    User: l.user?.name || 'Unknown',
    Action: l.action,
    Item: l.item?.name || 'N/A',
    Details: l.details
  })));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
