import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import vaultRoutes from './routes/vault';
import orgRoutes from './routes/org';
import logRoutes from './routes/logs';

dotenv.config();

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

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LDP Bitwarden API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app, prisma };
