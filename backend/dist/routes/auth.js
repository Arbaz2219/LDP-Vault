"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, organizationName } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await index_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const masterPasswordHash = await bcryptjs_1.default.hash(password, 10);
        let organizationId = null;
        let isNewOrg = false;
        if (organizationName) {
            let org = await index_1.prisma.organization.findFirst({ where: { name: organizationName } });
            if (!org) {
                org = await index_1.prisma.organization.create({ data: { name: organizationName } });
                isNewOrg = true;
            }
            organizationId = org.id;
        }
        const user = await index_1.prisma.user.create({
            data: {
                email,
                masterPasswordHash,
                name,
                organizationId,
                role: isNewOrg ? 'ADMIN' : 'USER'
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.masterPasswordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Verify Master Password (for re-auth)
router.post('/verify-master', async (req, res) => {
    try {
        const { userId, password } = req.body;
        const user = await index_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        const isValid = await bcryptjs_1.default.compare(password, user.masterPasswordHash);
        res.json({ valid: isValid });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
