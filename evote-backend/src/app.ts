import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { mongoConnect } from './utils/db';
import authRoutes from './routes/auth';
import voterRoutes from './routes/voter';
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import voteRoutes from './routes/vote';
import { errorHandler } from './middleware/errorHandler';
import { 
  securityHeaders, 
  requestLogger, 
  createRateLimit 
} from './middleware/security';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean) as string[];

// In development, allow all origins to ease local/network testing
const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
app.use(cors({
  origin: (origin, callback) => {
    if (!isProd) {
      // dev: allow any origin (including http://192.168.x.x:3000)
      return callback(null, true);
    }
    // prod: only allow from explicit allowlist or no-origin requests
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Include custom header used for voter session
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Voter-Token'],
}));

app.use(securityHeaders);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  200, // max requests per IP
  'Too many requests, please try again later.'
);
app.use(generalLimiter);

// Connect to MongoDB
mongoConnect();

// ✅ Health-check route (for testing)
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/voter', voterRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Global error handler
app.use(errorHandler);

export default app;
