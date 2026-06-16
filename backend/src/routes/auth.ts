import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { msalClient, getRedirectUri } from '../utils/microsoftAuth';

const router = Router();
import { JWT_SECRET, FRONTEND_URL } from '../config';

// Standard Registration (Disabled - SSO Only)
router.post('/register', (req, res) => {
  res.status(403).json({ error: 'Standard registration is disabled. Please use SSO.' });
});

// Standard Login (Re-enabled as fallback)
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

// Master Password Management (Disabled)
router.post('/verify-master', (req, res) => res.status(403).json({ error: 'Disabled' }));
router.post('/set-master', (req, res) => res.status(403).json({ error: 'Disabled' }));



// Microsoft SSO Login
router.get('/microsoft', async (req, res) => {
  const authCodeUrlParameters = {
    scopes: ["user.read"],
    redirectUri: getRedirectUri(req),
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
  const redirectUri = getRedirectUri(req);
  console.log('[AUTH] Callback received. Using Redirect URI:', redirectUri);

  const tokenRequest = {
    code: req.query.code as string,
    scopes: ["user.read"],
    redirectUri: redirectUri,
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
      portals: user.portals
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
    const host = req.get('host') || '';
    // Use production domain only if we are clearly on the production API host
    const isProduction = process.env.API_DOMAIN && host.startsWith(process.env.API_DOMAIN);

    const frontendUrl = isProduction 
      ? `https://${process.env.FRONTEND_DOMAIN}` 
      : (FRONTEND_URL || 'http://localhost:5173');
    
    const finalRedirectUrl = `${frontendUrl}/sso-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      portals: user.portals
    }))}`;

    console.log(`[AUTH] SSO success for ${email}.`);
    console.log(`[AUTH] Host: ${host}, isProduction: ${isProduction}`);
    console.log(`[AUTH] Frontend Base URL: ${frontendUrl}`);
    console.log(`[AUTH] Full Redirect URL: ${finalRedirectUrl}`);
    
    res.redirect(finalRedirectUrl);

  } catch (error: any) {
    console.error('Microsoft callback full error:', JSON.stringify(error, null, 2));
    res.status(500).send(`Authentication failed: ${error.errorMessage || error.message || 'Unknown error'}`);
  }
});

export default router;
