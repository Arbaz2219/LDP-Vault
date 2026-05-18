import { Router } from 'express';
import { prisma } from '../index';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all folders for the user
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const folders = await prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new folder
router.post('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: userId!
      }
    });
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rename folder
router.put('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Folder name is required' });

    const folder = await prisma.folder.update({
      where: { id: id as string },
      data: { name }
    });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete folder
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.folder.delete({
      where: { id: id as string }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
