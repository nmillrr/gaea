// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Configure Helmet with secure defaults
 * This adds various HTTP headers to enhance security
 */
export const helmetMiddleware = helmet({
  // Strict-Transport-Security enforces secure (HTTPS) connections
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  // Content-Security-Policy restricts the sources from which content can be loaded
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "*.amazonaws.com"], // Allow S3 images
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      scriptSrc: ["'self'"]
    }
  },
  // X-XSS-Protection prevents reflected XSS attacks
  xssFilter: true,
  // Don't allow the app to be embedded in iframes
  frameguard: { action: 'deny' },
  // Prevent MIME type sniffing
  noSniff: true
});

/**
 * Middleware to enforce HTTPS
 * Redirects HTTP requests to HTTPS and sets HSTS headers
 */
export const enforceHttps = (req: Request, res: Response, next: NextFunction) => {
  // Skip for development environments
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return next();
  }
  
  // Check if the request is secure or forwarded from a secure connection
  // Heroku and similar platforms use X-Forwarded-Proto header
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure) {
    // Redirect to HTTPS
    const httpsUrl = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, httpsUrl);
  }
  
  next();
};

/**
 * Middleware to prevent clickjacking
 * Sets X-Frame-Options header
 */
export const preventClickjacking = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};

/**
 * Middleware to enable strict transport security
 * Sets Strict-Transport-Security header
 */
export const enableHSTS = (req: Request, res: Response, next: NextFunction) => {
  // Skip for development environments
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return next();
  }
  
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
};

/**
 * Middleware to prevent content type sniffing
 * Sets X-Content-Type-Options header
 */
export const preventSniffing = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
};

/**
 * Middleware to prevent XSS attacks
 * Sets X-XSS-Protection header
 */
export const preventXSS = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

/**
 * Combined security middleware
 * This is a convenience export that combines all security middleware
 */
export const securityMiddleware = [
  enforceHttps,
  helmetMiddleware,
  preventClickjacking,
  enableHSTS,
  preventSniffing,
  preventXSS
];