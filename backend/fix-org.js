const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing Organization connection...');
  
  // 1. Get or create an organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'LDP Logistics' }
    });
    console.log('Created new organization:', org.name);
  } else {
    console.log('Using existing organization:', org.name);
  }

  // 2. Link the admin user to this organization
  await prisma.user.update({
    where: { email: 'help-desk@ldplogistics.com' },
    data: {
      organizationId: org.id
    }
  });
  
  console.log('Linked help-desk@ldplogistics.com to organization:', org.name);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
