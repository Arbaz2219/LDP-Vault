import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all vault items for the user (personal + shared via departments)
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    // Get user with their departments
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        departments: {
          select: { departmentId: true }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const departmentIds = user.departments.map(d => d.departmentId);

    const vaultItems = await prisma.vaultItem.findMany({
      where: {
        OR: [
          { userId },
          { departmentId: { in: departmentIds } }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(vaultItems);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new vault item
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { 
      name, username, password, url, notes, departmentId, isHidden,
      type, isFavorite, folderId, collectionId,
      cardholderName, cardNumber, expirationMonth, expirationYear, cvv,
      firstName, lastName, address, phone, licenseNumber
    } = req.body;

    if (!name) return res.status(400).json({ error: 'Name is required' });

    let domain = null;
    if (url) {
      try {
        domain = new URL(url).hostname;
      } catch (e) {
        domain = url;
      }
    }

    const vaultItem = await prisma.vaultItem.create({
      data: {
        name,
        username,
        password, // Client-side encrypted
        url,
        domain,
        notes,
        isHidden: isHidden || false,
        type: type || 'login',
        isFavorite: isFavorite || false,
        folderId: folderId || undefined,
        collectionId: collectionId || undefined,
        cardholderName,
        cardNumber,
        expirationMonth,
        expirationYear,
        cvv,
        firstName,
        lastName,
        address,
        phone,
        licenseNumber,
        userId: departmentId ? undefined : userId,
        departmentId: departmentId || undefined
      }
    });

    res.status(201).json(vaultItem);
  } catch (error) {
    console.error('Failed to create vault item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Domain matching for extension
router.get('/match', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { domain } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { departments: { select: { departmentId: true } } }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    const departmentIds = user.departments.map(d => d.departmentId);

    const items = await prisma.vaultItem.findMany({
      where: {
        domain: domain as string,
        OR: [
          { userId },
          { departmentId: { in: departmentIds } }
        ]
      }
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vault item
router.put('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { 
      name, username, password, url, notes, isHidden,
      type, isFavorite, folderId, collectionId,
      cardholderName, cardNumber, expirationMonth, expirationYear, cvv,
      firstName, lastName, address, phone, licenseNumber
    } = req.body;

    let domain = null;
    if (url) {
      try {
        domain = new URL(url).hostname;
      } catch (e) {
        domain = url;
      }
    }

    const vaultItem = await prisma.vaultItem.update({
      where: { id: id as string },
      data: { 
        name, 
        username, 
        password, 
        url, 
        domain,
        notes, 
        isHidden: isHidden !== undefined ? isHidden : undefined,
        type: type !== undefined ? type : undefined,
        isFavorite: isFavorite !== undefined ? isFavorite : undefined,
        folderId: folderId === null ? null : (folderId || undefined),
        collectionId: collectionId === null ? null : (collectionId || undefined),
        cardholderName,
        cardNumber,
        expirationMonth,
        expirationYear,
        cvv,
        firstName,
        lastName,
        address,
        phone,
        licenseNumber
      }
    });

    res.json(vaultItem);
  } catch (error) {
    console.error('Failed to update vault item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vault item
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // First delete or decouple associated audit logs to avoid foreign key constraints
    await prisma.auditLog.deleteMany({
      where: { itemId: id as string }
    });

    await prisma.vaultItem.delete({ where: { id: id as string } });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete vault item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
