import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import AuditLog from '../models/AuditLog';

// Rate limiting for different endpoints
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message || 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Specific rate limits
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later.'
);

export const voteRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  3, // 3 attempts
  'Too many voting attempts, please try again later.'
);

export const otpRateLimit = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  3, // 3 attempts
  'Too many OTP requests, please try again later.'
);

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
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

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
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

// Audit logging middleware
export const auditLogger = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log audit entry after response is sent
      setImmediate(async () => {
        try {
          await AuditLog.create({
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
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Input validation middleware
export const validateElectionData = (req: Request, res: Response, next: NextFunction) => {
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

// Voter data validation
export const validateVoterData = (req: Request, res: Response, next: NextFunction) => {
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
  // Do NOT reject purely numeric identifiers here; they could be voter IDs.
  // Phone number validation is intentionally relaxed to avoid blocking numeric voter IDs.
  // If you need strict phone validation, handle it at the point of data entry/registration.
  
  next();
};

// OTP validation
export const validateOtp = (req: Request, res: Response, next: NextFunction) => {
  const { otp } = req.body;
  
  if (!otp || typeof otp !== 'string') {
    return res.status(400).json({ error: 'OTP is required' });
  }
  
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be exactly 6 digits' });
  }
  
  next();
};





