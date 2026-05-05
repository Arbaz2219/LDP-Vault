import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, organizationName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const masterPasswordHash = await bcrypt.hash(password, 10);

    let organizationId = null;
    if (organizationName) {
      // Check if org exists or create it (For LDP Logistics internal use, we might pre-seed this)
      let org = await prisma.organization.findFirst({ where: { name: organizationName } });
      if (!org) {
        org = await prisma.organization.create({ data: { name: organizationName } });
      }
      organizationId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        masterPasswordHash,
        name,
        organizationId,
        role: organizationName ? 'ADMIN' : 'USER' // First user of an org is admin
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.masterPasswordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Master Password (for re-auth)
router.post('/verify-master', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValid = await bcrypt.compare(password, user.masterPasswordHash);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
