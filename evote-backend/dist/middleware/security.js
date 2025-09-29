"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOtp = exports.validateVoterData = exports.validateElectionData = exports.auditLogger = exports.requestLogger = exports.securityHeaders = exports.otpRateLimit = exports.voteRateLimit = exports.authRateLimit = exports.createRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
// Rate limiting for different endpoints
const createRateLimit = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: { error: message || 'Too many requests, please try again later.' },
        standardHeaders: true,
        legacyHeaders: false,
    });
};
exports.createRateLimit = createRateLimit;
// Specific rate limits
exports.authRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, // 15 minutes
5, // 5 attempts
'Too many authentication attempts, please try again later.');
exports.voteRateLimit = (0, exports.createRateLimit)(60 * 1000, // 1 minute
3, // 3 attempts
'Too many voting attempts, please try again later.');
exports.otpRateLimit = (0, exports.createRateLimit)(5 * 60 * 1000, // 5 minutes
3, // 3 attempts
'Too many OTP requests, please try again later.');
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
};
exports.securityHeaders = securityHeaders;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            timestamp: new Date()
        };
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`${logData.method} ${logData.url} ${logData.status} - ${logData.duration}ms`);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
// Audit logging middleware
const auditLogger = (action) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            // Log audit entry after response is sent
            setImmediate(async () => {
                try {
                    await AuditLog_1.default.create({
                        actorType: req.adminId ? 'admin' : 'voter',
                        actorId: req.adminId || req.ip,
                        action,
                        metadata: {
                            method: req.method,
                            url: req.url,
                            status: res.statusCode,
                            userAgent: req.get('User-Agent'),
                            ip: req.ip,
                            timestamp: new Date()
                        }
                    });
                }
                catch (error) {
                    console.error('Audit logging failed:', error);
                }
            });
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.auditLogger = auditLogger;
// Input validation middleware
const validateElectionData = (req, res, next) => {
    const { title, description, candidates, startAt, endAt } = req.body;
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    if (title.length > 200) {
        return res.status(400).json({ error: 'Title must be less than 200 characters' });
    }
    if (description && typeof description !== 'string') {
        return res.status(400).json({ error: 'Description must be a string' });
    }
    if (description && description.length > 1000) {
        return res.status(400).json({ error: 'Description must be less than 1000 characters' });
    }
    if (!Array.isArray(candidates) || candidates.length === 0) {
        return res.status(400).json({ error: 'At least one candidate is required' });
    }
    for (const candidate of candidates) {
        if (!candidate.id || !candidate.name ||
            typeof candidate.id !== 'string' ||
            typeof candidate.name !== 'string' ||
            candidate.id.trim().length === 0 ||
            candidate.name.trim().length === 0) {
            return res.status(400).json({ error: 'Each candidate must have a valid ID and name' });
        }
    }
    if (!startAt || !endAt) {
        return res.status(400).json({ error: 'Start and end dates are required' });
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    const now = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }
    if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
    }
    if (start <= now) {
        return res.status(400).json({ error: 'Start date must be in the future' });
    }
    next();
};
exports.validateElectionData = validateElectionData;
// Voter data validation
const validateVoterData = (req, res, next) => {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
        return res.status(400).json({ error: 'Identifier is required' });
    }
    if (identifier.length > 100) {
        return res.status(400).json({ error: 'Identifier must be less than 100 characters' });
    }
    // Basic email validation
    if (identifier.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
    }
    // Basic phone validation (digits only, 10-15 characters)
    if (/^\d+$/.test(identifier)) {
        if (identifier.length < 10 || identifier.length > 15) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }
    }
    next();
};
exports.validateVoterData = validateVoterData;
// OTP validation
const validateOtp = (req, res, next) => {
    const { otp } = req.body;
    if (!otp || typeof otp !== 'string') {
        return res.status(400).json({ error: 'OTP is required' });
    }
    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({ error: 'OTP must be exactly 6 digits' });
    }
    next();
};
exports.validateOtp = validateOtp;
