import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
const { chromium } = require('playwright');
const CryptoJS = require('crypto-js');

const router = Router();

// Launch a terminal using Playwright
router.post('/launch/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id as string;
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res.status(400).json({ error: 'Master password is required for decryption' });
    }

    const item = await prisma.vaultItem.findUnique({
      where: { id }
    });

    if (!item || !item.url || !item.username || !item.password) {
      return res.status(404).json({ error: 'Item not found or missing required fields' });
    }

    // Decrypt credentials
    let password = '';
    try {
      const bytes = CryptoJS.AES.decrypt(item.password, masterPassword);
      password = bytes.toString(CryptoJS.enc.Utf8);
      if (!password) throw new Error('Decryption failed');
    } catch (e) {
      return res.status(401).json({ error: 'Invalid master password or corrupted data' });
    }

    // Launch Playwright Automation
    // Note: This launches the browser on the SERVER machine (the user's PC)
    (async () => {
      const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
      });
      const context = await browser.newContext({ viewport: null });
      const page = await context.newPage();

      try {
        const targetUrl = item.url!;
        console.log(`LDP Automation: Launching ${targetUrl}`);
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });


        // Inject Secure Blur
        await page.addStyleTag({
          content: `
            html { 
              filter: blur(25px) brightness(0.8) !important; 
              transition: filter 1.5s ease-in-out !important;
              pointer-events: none !important;
              user-select: none !important;
            }
          `
        });

        // Specialized logic for Maher Terminals
        if (targetUrl.includes('maherterminals.com')) {
          console.log('LDP Automation: Detected Maher Terminal, performing login...');

          
          await page.waitForSelector('input[id^="mat-input-"]', { timeout: 10000 });
          const inputs = await page.$$('input[id^="mat-input-"]');
          if (inputs.length >= 2) {
            await inputs[0].fill(item.username);
            await inputs[1].fill(password);
            const loginBtn = await page.waitForSelector('button.blueButton', { timeout: 5000 });
            await loginBtn.click();
          }
        } else {
          const passwordField = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
          if (passwordField) {
            const usernameField = await page.$('input[type="text"], input[type="email"]');
            if (usernameField) await usernameField.fill(item.username);
            await passwordField.fill(password);
            await page.keyboard.press('Enter');
          }
        }

        // Wait for navigation or successful login indicators
        await page.waitForTimeout(3000);

        // Gently lift the blur
        await page.evaluate(() => {
          const style = document.createElement('style');
          style.textContent = `
            html { 
              filter: blur(0px) brightness(1) !important;
              pointer-events: auto !important;
              user-select: auto !important;
            }
          `;
          document.head.appendChild(style);
        });

        console.log('LDP Automation: Secure Blur lifted. User is in control.');


      } catch (automationError) {
        console.error('LDP Automation Error:', automationError);
        // We don't close the browser so user can see what happened
      }
    })();

    res.json({ message: 'Automation started successfully. Check your desktop for the new browser window.' });
  } catch (error) {
    console.error('Failed to initiate automation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
