"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
// Get organization details
router.get('/', auth_1.authenticateJWT, async (req, res) => {
    try {
        const user = await index_1.prisma.user.findUnique({
            where: { id: req.user?.userId },
            include: { organization: true }
        });
        res.json(user?.organization);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get departments for organization
router.get('/departments', auth_1.authenticateJWT, async (req, res) => {
    try {
        const user = await index_1.prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!user?.organizationId)
            return res.json([]);
        const departments = await index_1.prisma.department.findMany({
            where: { organizationId: user.organizationId },
            include: {
                _count: {
                    select: { users: true, vaultItems: true }
                }
            }
        });
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create department (Admin only)
router.post('/departments', auth_1.authenticateJWT, isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const user = await index_1.prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!user?.organizationId)
            return res.status(400).json({ error: 'User not part of an organization' });
        const department = await index_1.prisma.department.create({
            data: {
                name,
                organizationId: user.organizationId
            }
        });
        res.status(201).json(department);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Assign user to department (Admin only)
router.post('/departments/:deptId/users', auth_1.authenticateJWT, isAdmin, async (req, res) => {
    try {
        const { deptId } = req.params;
        const { userId, permission } = req.body;
        const deptUser = await index_1.prisma.departmentUser.create({
            data: {
                departmentId: deptId,
                userId,
                permission: permission || 'READ'
            }
        });
        res.status(201).json(deptUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all users in organization (Admin only)
router.get('/users', auth_1.authenticateJWT, isAdmin, async (req, res) => {
    try {
        const user = await index_1.prisma.user.findUnique({ where: { id: req.user?.userId } });
        const users = await index_1.prisma.user.findMany({
            where: { organizationId: user?.organizationId },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Create user in organization (Admin only)
router.post('/users', auth_1.authenticateJWT, isAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const adminUser = await index_1.prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!adminUser?.organizationId)
            return res.status(400).json({ error: 'Admin not in organization' });
        const existingUser = await index_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });
        const hashedPassword = await bcryptjs_1.default.hash(password || 'password123', 10);
        const newUser = await index_1.prisma.user.create({
            data: {
                name,
                email,
                masterPasswordHash: hashedPassword,
                role: role || 'USER',
                organizationId: adminUser.organizationId
            }
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update organization settings (Admin only)
router.patch('/', auth_1.authenticateJWT, isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        const user = await index_1.prisma.user.findUnique({ where: { id: req.user?.userId } });
        if (!user?.organizationId)
            return res.status(404).json({ error: 'Organization not found' });
        const updatedOrg = await index_1.prisma.organization.update({
            where: { id: user.organizationId },
            data: { name }
        });
        res.json(updatedOrg);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
