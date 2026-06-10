import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { msalClient, REDIRECT_URI } from '../utils/microsoftAuth';

const router = Router();
import { JWT_SECRET, FRONTEND_URL } from '../config';

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

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, portals: user.portals }, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, portals: user.portals } });
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

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role, portals: user.portals }, JWT_SECRET, { expiresIn: '8h' });

    // Audit Log: Successful Login
    await prisma.auditLog.create({
      data: {
        action: 'SUCCESSFUL_LOGIN',
        userId: user.id,
        details: `User ${user.email} logged in successfully via standard credentials.`
      }
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, portals: user.portals } });
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

// Set Master Password (first time for SSO users)
router.post('/set-master', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.masterPasswordHash) return res.status(400).json({ error: 'Master password already set' });

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { masterPasswordHash: hash }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Microsoft SSO Login
router.get('/microsoft', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: REDIRECT_URI,
    prompt: "select_account",
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
      // We set masterPasswordHash to null so they MUST set it on first login
      user = await prisma.user.create({
        data: {
          email,
          name: name as string,
          masterPasswordHash: null, 
          role: 'USER',
          portals: ['vault']
        }
      });
    }


    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      portals: user.portals,
      isMasterPasswordSet: !!user.masterPasswordHash
    }, JWT_SECRET, { expiresIn: '8h' });

    // Audit Log: SSO Successful Login
    await prisma.auditLog.create({
      data: {
        action: 'SSO_LOGIN',
        userId: user.id,
        details: `User ${user.email} logged in successfully via Microsoft SSO.`
      }
    });

    // Redirect back to frontend with token
    // Detect if we should use the domain or keep localhost for dev
    const useDomain = process.env.FRONTEND_DOMAIN && !req.get('host')?.includes('localhost');
    const frontendUrl = useDomain 
      ? `https://${process.env.FRONTEND_DOMAIN}` 
      : (FRONTEND_URL || 'http://localhost:5173');
    
    const finalRedirectUrl = `${frontendUrl}/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      portals: user.portals
    }))}`;

    console.log(`[AUTH] SSO success for ${email}. Redirecting to ${frontendUrl}/login`);
    console.log(`[AUTH] Full Redirect URL: ${finalRedirectUrl}`);
    
    res.redirect(finalRedirectUrl);

  } catch (error: any) {
    console.error('Microsoft callback full error:', JSON.stringify(error, null, 2));
    res.status(500).send(`Authentication failed: ${error.errorMessage || error.message || 'Unknown error'}`);
  }
});

export default router;
