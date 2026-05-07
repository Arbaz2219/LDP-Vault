"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all vault items for the user (personal + shared via departments)
router.get('/', auth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        // Get user with their departments
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                departments: {
                    select: { departmentId: true }
                }
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const departmentIds = user.departments.map(d => d.departmentId);
        const vaultItems = await index_1.prisma.vaultItem.findMany({
            where: {
                OR: [
                    { userId },
                    { departmentId: { in: departmentIds } }
                ]
            },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(vaultItems);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Add new vault item
router.post('/', auth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { name, username, password, url, notes, departmentId, isHidden } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        let domain = null;
        if (url) {
            try {
                domain = new URL(url).hostname;
            }
            catch (e) {
                domain = url;
            }
        }
        const vaultItem = await index_1.prisma.vaultItem.create({
            data: {
                name,
                username,
                password, // Client-side encrypted
                url,
                domain,
                notes,
                isHidden: isHidden || false,
                userId: departmentId ? undefined : userId,
                departmentId: departmentId || undefined
            }
        });
        res.status(201).json(vaultItem);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Domain matching for extension
router.get('/match', auth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { domain } = req.query;
        const user = await index_1.prisma.user.findUnique({
            where: { id: userId },
            include: { departments: { select: { departmentId: true } } }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const departmentIds = user.departments.map(d => d.departmentId);
        const items = await index_1.prisma.vaultItem.findMany({
            where: {
                domain: domain,
                OR: [
                    { userId },
                    { departmentId: { in: departmentIds } }
                ]
            }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update vault item
router.put('/:id', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, username, password, url, notes } = req.body;
        const vaultItem = await index_1.prisma.vaultItem.update({
            where: { id: id },
            data: { name, username, password, url, notes }
        });
        res.json(vaultItem);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete vault item
router.delete('/:id', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        await index_1.prisma.vaultItem.delete({ where: { id: id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
