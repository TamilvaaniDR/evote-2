"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./utils/db");
const auth_1 = __importDefault(require("./routes/auth"));
const voter_1 = __importDefault(require("./routes/voter"));
const admin_1 = __importDefault(require("./routes/admin"));
const vote_1 = __importDefault(require("./routes/vote"));
const errorHandler_1 = require("./middleware/errorHandler");
const security_1 = require("./middleware/security");
const app = (0, express_1.default)();
// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);
// Security middlewares
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(security_1.securityHeaders);
app.use(security_1.requestLogger);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// General rate limiting
const generalLimiter = (0, security_1.createRateLimit)(15 * 60 * 1000, // 15 minutes
200, // max requests per IP
'Too many requests, please try again later.');
app.use(generalLimiter);
// Connect to MongoDB
(0, db_1.mongoConnect)();
// ✅ Health-check route (for testing)
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/voter', voter_1.default);
app.use('/api/vote', vote_1.default);
app.use('/api/admin', admin_1.default);
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
