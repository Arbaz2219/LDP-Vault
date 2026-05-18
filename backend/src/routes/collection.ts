import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all collections for the user
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new collection
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Collection name is required' });

    const collection = await prisma.collection.create({
      data: {
        name,
        userId: userId!
      }
    });
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rename collection
router.put('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Collection name is required' });

    const collection = await prisma.collection.update({
      where: { id: id as string },
      data: { name }
    });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete collection
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.collection.delete({
      where: { id: id as string }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
