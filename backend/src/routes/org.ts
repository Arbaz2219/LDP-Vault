import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { sendInvitationEmail } from '../utils/email';

const router = Router();

// Middleware to check if user is admin
const isAdmin = (req: AuthRequest, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get organization details
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: { organization: true }
    });
    res.json(user?.organization);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get departments for organization
router.get('/departments', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    if (!user?.organizationId) return res.json([]);

    const departments = await prisma.department.findMany({
      where: { organizationId: user.organizationId },
      include: {
        _count: {
          select: { users: true, vaultItems: true }
        }
      }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create department (Admin only)
router.post('/departments', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    if (!user?.organizationId) return res.status(400).json({ error: 'User not part of an organization' });

    const department = await prisma.department.create({
      data: {
        name,
        organizationId: user.organizationId
      }
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign user to department (Admin only)
router.post('/departments/:deptId/users', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { deptId } = req.params;
    const { userId, permission } = req.body;

    const deptUser = await prisma.departmentUser.create({
      data: {
        departmentId: deptId as string,
        userId,
        permission: permission || 'READ'
      }
    });
    res.status(201).json(deptUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users in organization (Admin only)
router.get('/users', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    const users = await prisma.user.findMany({
      where: { organizationId: user?.organizationId },
      select: { id: true, name: true, email: true, role: true, portals: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user in organization (Admin only)
router.post('/users', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, email, password, role, portals } = req.body;
    const adminUser = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    if (!adminUser?.organizationId) return res.status(400).json({ error: 'Admin not in organization' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        masterPasswordHash: hashedPassword,
        role: role || 'USER',
        organizationId: adminUser.organizationId,
        portals: portals || ['vault']
      }
    });

    // Send the welcome email with their initial credentials
    await sendInvitationEmail(email, name, password || 'password123');

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset user password (Admin only)
router.post('/users/:userId/reset-password', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const { newPassword } = req.body;
    const adminUser = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    if (!adminUser?.organizationId) return res.status(400).json({ error: 'Admin not in organization' });

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.organizationId !== adminUser.organizationId) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { masterPasswordHash: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user portals (Admin only)
router.patch('/users/:userId/portals', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const { portals } = req.body;
    
    if (!Array.isArray(portals)) {
      return res.status(400).json({ error: 'Portals must be an array' });
    }

    const adminUser = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!targetUser || targetUser.organizationId !== adminUser?.organizationId) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { portals }
    });

    res.json({ message: 'Portals updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update organization settings (Admin only)
router.patch('/', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    if (!user?.organizationId) return res.status(404).json({ error: 'Organization not found' });

    const updatedOrg = await prisma.organization.update({
      where: { id: user.organizationId },
      data: { name }
    });
    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete User (Admin only)
router.delete('/users/:userId', authenticateJWT, isAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.userId as string;
    const adminUser = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    // Prevent self-deletion
    if (userId === req.user?.userId) {
       return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser || targetUser.organizationId !== adminUser?.organizationId) {
      return res.status(404).json({ error: 'User not found in your organization' });
    }

    // Cleanup associated data
    await prisma.auditLog.deleteMany({ where: { userId } });
    await prisma.departmentUser.deleteMany({ where: { userId } });
    
    // Decouple items instead of deleting? No, Bitwarden style usually deletes personal items.
    await prisma.vaultItem.deleteMany({ where: { userId } });
    await prisma.folder.deleteMany({ where: { userId } });
    await prisma.collection.deleteMany({ where: { userId } });

    await prisma.user.delete({ where: { id: userId } });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
