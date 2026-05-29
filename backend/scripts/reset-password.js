const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'help-desk@ldplogistics.com'; // Admin email
  const password = '123456';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { email },
    data: { masterPasswordHash: hashedPassword }
  });

  console.log(`Password for ${email} has been reset to 123456`);
}

resetPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
