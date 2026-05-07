"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Log a security action
router.post('/', auth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { action, itemId, details } = req.body;
        const log = await index_1.prisma.auditLog.create({
            data: {
                action,
                userId: userId,
                itemId,
                details
            }
        });
        res.status(201).json(log);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get logs (Admins only)
router.get('/', auth_1.authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await index_1.prisma.user.findUnique({ where: { id: userId } });
        if (user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const logs = await index_1.prisma.auditLog.findMany({
            include: {
                user: { select: { name: true, email: true } },
                item: { select: { name: true } }
            },
            orderBy: { timestamp: 'desc' }
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
