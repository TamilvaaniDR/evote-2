"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Admin_1 = __importDefault(require("../models/Admin"));
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const security_1 = require("../middleware/security");
const router = (0, express_1.Router)();
// Apply rate limiting to auth routes
router.use(security_1.authRateLimit);
router.post('/admin/register', (0, security_1.auditLogger)('admin_register'), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Email and password must be strings' });
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        // Password validation
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }
        // Check if admin already exists
        const existingAdmin = await Admin_1.default.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ error: 'Admin with this email already exists' });
        }
        const hash = await argon2_1.default.hash(password, {
            type: argon2_1.default.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1,
        });
        const admin = new Admin_1.default({
            email: email.toLowerCase().trim(),
            passwordHash: hash,
            roles: ['admin']
        });
        await admin.save();
        res.json({ ok: true, message: 'Admin registered successfully' });
    }
    catch (err) {
        next(err);
    }
});
router.post('/admin/login', (0, security_1.auditLogger)('admin_login'), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Email and password must be strings' });
        }
        const admin = await Admin_1.default.findOne({ email: email.toLowerCase().trim() });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const ok = await argon2_1.default.verify(admin.passwordHash, password);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({
            sub: admin._id,
            roles: admin.roles,
            email: admin.email
        }, process.env.JWT_ADMIN_SECRET || 'secret', {
            expiresIn: '8h',
            issuer: 'evote-system',
            audience: 'evote-admin'
        });
        res.json({
            token,
            admin: {
                id: admin._id,
                email: admin.email,
                roles: admin.roles
            }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
