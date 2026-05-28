import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import vaultRoutes from './routes/vault';
import orgRoutes from './routes/org';
import logRoutes from './routes/logs';
import folderRoutes from './routes/folder';
import collectionRoutes from './routes/collection';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/folder', folderRoutes);
app.use('/api/collection', collectionRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LDP VAULT API' });
});

// Auto-provision admin user for Arbaz
const provisionAdmin = async () => {
  try {
    console.log('--- Provising Admin User Check ---');
    const adminEmail = 'help-desk@ldplogistics.com';
    
    // Ensure an organization exists
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: { name: 'LDP Logistics' }
      });
      console.log('Created Default Organization');
    }

    // Ensure the admin user exists and is configured correctly
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (user) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          portals: ['vault', 'admin'],
          organizationId: org.id
        }
      });
      console.log('Admin User Provisioned Successfully');
    }
  } catch (err) {
    console.error('Failed to provision admin:', err);
  }
};

// Start server
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await provisionAdmin();
});

export { app, prisma };
