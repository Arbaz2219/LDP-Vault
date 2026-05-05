import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Log a security action
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { action, itemId, details } = req.body;

    const log = await prisma.auditLog.create({
      data: {
        action,
        userId: userId!,
        itemId,
        details
      }
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get logs (Admins only)
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
        item: { select: { name: true } }
      },
      orderBy: { timestamp: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
