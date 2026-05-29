const { PrismaClient } = require('@prisma/client');
const CryptoJS = require('crypto-js');

const prisma = new PrismaClient();

async function main() {
  const userEmail = 'help-desk@ldplogistics.com'; // Change this if needed
  const masterPassword = '123456'; // Change this if needed
  
  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  const name = 'Maher Terminal';
  const username = 'INFO@LDPLOGISTIC.COM';
  const rawPassword = '3fmZS24n2@6A^x';
  const url = 'https://mahercsp.maherterminals.com/CSP/';
  
  // Encrypt password using CryptoJS (same logic as frontend)
  const encryptedPassword = CryptoJS.AES.encrypt(rawPassword, masterPassword).toString();
  
  let domain = 'mahercsp.maherterminals.com';

  const vaultItem = await prisma.vaultItem.create({
    data: {
      name,
      username,
      password: encryptedPassword,
      url,
      domain,
      type: 'login',
      userId: user.id,
      isFavorite: true
    }
  });

  console.log('Vault item created:', vaultItem.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
