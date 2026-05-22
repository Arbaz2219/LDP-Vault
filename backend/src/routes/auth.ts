import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { msalClient, REDIRECT_URI } from '../utils/microsoftAuth';

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
    let isNewOrg = false;
    if (organizationName) {
      let org = await prisma.organization.findFirst({ where: { name: organizationName } });
      if (!org) {
        org = await prisma.organization.create({ data: { name: organizationName } });
        isNewOrg = true;
      }
      organizationId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        masterPasswordHash,
        name,
        organizationId,
        role: isNewOrg ? 'ADMIN' : 'USER'
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
    if (!user || !user.masterPasswordHash) {
      return res.status(401).json({ error: 'Invalid credentials or SSO account' });
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
    if (!user || !user.masterPasswordHash) return res.status(404).json({ error: 'User not found or password not set' });

    const isValid = await bcrypt.compare(password, user.masterPasswordHash);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Microsoft SSO Login
router.get('/microsoft', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: REDIRECT_URI,
  };

  try {
    const response = await msalClient.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(response);
  } catch (error) {
    console.error('Error generating Microsoft auth URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Microsoft SSO Callback
router.get('/microsoft/callback', async (req, res) => {
  const tokenRequest = {
    code: req.query.code as string,
    scopes: ["user.read"],
    redirectUri: REDIRECT_URI,
  };

  try {
    const response = await msalClient.acquireTokenByCode(tokenRequest);
    const email = response.account?.username?.toLowerCase();
    const name = response.account?.name || email;

    if (!email) {
      return res.status(400).json({ error: 'Could not get email from Microsoft' });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-register the SSO user if they don't exist
      // Note: They won't have a master password for encryption yet!
      user = await prisma.user.create({
        data: {
          email,
          name: name as string,
          masterPasswordHash: '', // SSO users need to set this later for vault access
          role: 'USER'
        }
      });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    // Redirect back to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }))}`);

  } catch (error) {
    console.error('Microsoft callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

export default router;
