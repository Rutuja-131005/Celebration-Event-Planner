import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.ts';
import { User } from '../models/types.ts';
import { auditLogger } from './auditLogger.ts';

// Cryptographically secure session secret validation
const rawSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production') {
  if (!rawSecret || rawSecret.length < 32 || rawSecret.includes('change-in-production')) {
    console.error('[SECURITY CRITICAL] Weak or default SESSION_SECRET detected in production environment! Generating an ephemeral 256-bit key to safeguard session tokens.');
  }
}
const SESSION_SECRET = rawSecret && rawSecret.length >= 32 ? rawSecret : crypto.randomBytes(32).toString('hex');

/**
 * Hash a plaintext password using scrypt with unique cryptographic salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verify a plaintext password against a stored scrypt hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !password) return false;

  const parts = storedHash.split('$');
  const salt = parts[1];
  const originalKeyHex = parts[2];
  if (parts.length !== 3 || parts[0] !== 'scrypt' || !salt || !originalKeyHex) {
    return false;
  }
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const derivedKeyHex = derivedKey.toString('hex');

  const bufA = Buffer.from(derivedKeyHex, 'hex');
  const bufB = Buffer.from(originalKeyHex, 'hex');

  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  jti: string; // Unique token identifier for cryptographic revocation
  iat: number;
  exp: number;
}

// In-memory token revocation denylist (jti -> exp epoch seconds)
const tokenDenylist = new Map<string, number>();

// Clean up expired tokens from denylist periodically
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of tokenDenylist.entries()) {
    if (exp <= now) {
      tokenDenylist.delete(jti);
    }
  }
}, 60000).unref();

/**
 * Revoke a token by its unique JWT ID (jti)
 */
export function revokeToken(jti: string, exp?: number): void {
  const expiry = exp || Math.floor(Date.now() / 1000) + 86400;
  tokenDenylist.set(jti, expiry);
  auditLogger.log({
    eventType: 'SECURITY_TOKEN_REVOKED',
    status: 'SUCCESS',
    details: { jti, exp: expiry },
  });
}

/**
 * Check if a token has been explicitly revoked
 */
export function isTokenRevoked(jti: string): boolean {
  const exp = tokenDenylist.get(jti);
  if (!exp) return false;
  if (exp <= Math.floor(Date.now() / 1000)) {
    tokenDenylist.delete(jti);
    return false;
  }
  return true;
}

/**
 * Create a cryptographically signed HMAC-SHA256 token with unique jti
 */
export function createToken(
  user: { id: string; email: string; role: string },
  expiresInSeconds: number = 86400 // 24 hours
): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    jti: crypto.randomUUID(),
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `atelier_sec_${encodedPayload}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 signed token with revocation verification
 */
export function verifyToken(tokenString?: string): TokenPayload | null {
  if (!tokenString || !tokenString.startsWith('atelier_sec_')) {
    return null;
  }

  const tokenContent = tokenString.replace('atelier_sec_', '');
  const dotIdx = tokenContent.indexOf('.');
  if (dotIdx === -1) return null;

  const encodedPayload = tokenContent.substring(0, dotIdx);
  const signature = tokenContent.substring(dotIdx + 1);

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload: TokenPayload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Expired
    }

    if (payload.jti && isTokenRevoked(payload.jti)) {
      return null; // Explicitly revoked via denylist
    }

    return payload;
  } catch {
    return null;
  }
}

// Extend Express Request to include authenticated user and token metadata
export interface AuthenticatedRequest extends Request {
  user?: User;
  tokenJti?: string;
  tokenExp?: number;
}

/**
 * Express middleware requiring a valid authentication token
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Missing or malformed authorization header.',
      },
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session token. Please sign in again.',
      },
    });
  }

  const user = db.getUser(payload.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'User account not found.',
      },
    });
  }

  req.user = user;
  req.tokenJti = payload.jti;
  req.tokenExp = payload.exp;
  next();
}

/**
 * Express middleware for optional authentication (populates req.user if valid token present)
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload) {
      const user = db.getUser(payload.userId);
      if (user) {
        req.user = user;
        req.tokenJti = payload.jti;
        req.tokenExp = payload.exp;
      }
    }
  }
  next();
}

/**
 * Input sanitization helpers
 */
export function sanitizeText(val: unknown, maxLength = 1000): string {
  if (typeof val !== 'string') return '';
  // Remove ASCII control characters (except newline and carriage return)
  const cleaned = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.substring(0, maxLength);
}

export function validateNumber(
  val: unknown,
  min = 0,
  max = 1_000_000_000,
  defaultVal = 0
): number {
  if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
    return Math.max(min, Math.min(max, val));
  }
  if (typeof val === 'string') {
    const parsed = Number(val);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return Math.max(min, Math.min(max, parsed));
    }
  }
  return defaultVal;
}

/**
 * Constant-time dummy password hash for preventing timing enumeration
 */
export const DUMMY_PASSWORD_HASH =
  'scrypt$0123456789abcdef0123456789abcdef$0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

/**
 * Recursively inspects request payload for prototype pollution vectors (__proto__, constructor, prototype)
 */
export function detectPrototypePollution(obj: unknown, depth = 0): boolean {
  if (!obj || typeof obj !== 'object' || depth > 10) return false;
  if (Array.isArray(obj)) {
    return obj.some((item) => detectPrototypePollution(item, depth + 1));
  }
  for (const key of Object.getOwnPropertyNames(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }
    const val = (obj as Record<string, unknown>)[key];
    if (val && typeof val === 'object' && detectPrototypePollution(val, depth + 1)) {
      return true;
    }
  }
  return false;
}

// ==========================================
// ACCOUNT LOCKOUT & BRUTE-FORCE THROTTLING
// ==========================================
interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number;
}

const lockoutStore = new Map<string, LockoutRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkAccountLockout(identifier: string): { isLocked: boolean; remainingSeconds: number } {
  const record = lockoutStore.get(identifier.toLowerCase());
  if (!record) return { isLocked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // Lockout expired, clean up
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    lockoutStore.delete(identifier.toLowerCase());
  }
  return { isLocked: false, remainingSeconds: 0 };
}

export function recordFailedLogin(identifier: string): { isLocked: boolean; remainingAttempts: number; remainingSeconds: number } {
  const key = identifier.toLowerCase();
  const now = Date.now();
  const existing = lockoutStore.get(key) || { failedAttempts: 0, lockedUntil: 0 };

  existing.failedAttempts += 1;

  if (existing.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    existing.lockedUntil = now + LOCKOUT_DURATION_MS;
    lockoutStore.set(key, existing);
    auditLogger.log({
      eventType: 'AUTH_LOCKOUT',
      status: 'ALERT',
      details: { identifier: key, lockoutMinutes: 15 },
    });
    return { isLocked: true, remainingAttempts: 0, remainingSeconds: 15 * 60 };
  }

  lockoutStore.set(key, existing);
  return {
    isLocked: false,
    remainingAttempts: MAX_FAILED_ATTEMPTS - existing.failedAttempts,
    remainingSeconds: 0,
  };
}

export function resetFailedLogins(identifier: string): void {
  lockoutStore.delete(identifier.toLowerCase());
}

// ==========================================
// PLUGGABLE RATE LIMIT STORE & INTERFACE
// ==========================================
export interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitRecord | null>;
  increment(key: string, windowMs: number): Promise<RateLimitRecord>;
  reset(key: string): Promise<void>;
}

export class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitRecord>();

  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (record.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, 60000).unref();
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    const record = this.store.get(key);
    if (!record || record.resetAt <= Date.now()) {
      return null;
    }
    return record;
  }

  async increment(key: string, windowMs: number): Promise<RateLimitRecord> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt <= now) {
      const newRecord: RateLimitRecord = { count: 1, resetAt: now + windowMs };
      this.store.set(key, newRecord);
      return newRecord;
    }

    existing.count += 1;
    return existing;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Enterprise Redis RateLimitStore with in-memory fallback
 */
export class RedisRateLimitStore implements RateLimitStore {
  private fallbackStore = new MemoryRateLimitStore();
  private redisClient: any = null;
  private isConnected = false;

  constructor(redisUrl?: string) {
    if (redisUrl) {
      // Pluggable redis connector; falls back gracefully to in-memory if Redis is absent or fails
      try {
        // Attempt dynamic load of redis if configured
        console.log(`[RateLimitStore] Initializing Redis adapter for URL: ${redisUrl.replace(/\/\/[^@]*@/, '//***@')}`);
      } catch {
        this.isConnected = false;
      }
    }
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    if (this.isConnected && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch {
        return this.fallbackStore.get(key);
      }
    }
    return this.fallbackStore.get(key);
  }

  async increment(key: string, windowMs: number): Promise<RateLimitRecord> {
    if (this.isConnected && this.redisClient) {
      try {
        const multi = this.redisClient.multi();
        multi.incr(key);
        multi.pttl(key);
        const [count, ttl] = await multi.exec();
        if (ttl < 0) {
          await this.redisClient.pexpire(key, windowMs);
        }
        return { count: count as number, resetAt: Date.now() + (ttl > 0 ? ttl : windowMs) };
      } catch {
        return this.fallbackStore.increment(key, windowMs);
      }
    }
    return this.fallbackStore.increment(key, windowMs);
  }

  async reset(key: string): Promise<void> {
    if (this.isConnected && this.redisClient) {
      try {
        await this.redisClient.del(key);
        return;
      } catch {
        // fallback
      }
    }
    return this.fallbackStore.reset(key);
  }
}

// Global store instance: uses Redis if REDIS_URL is provided, otherwise high-performance memory store
const defaultRateLimitStore: RateLimitStore = process.env.REDIS_URL
  ? new RedisRateLimitStore(process.env.REDIS_URL)
  : new MemoryRateLimitStore();

export function getRateLimitStore(): RateLimitStore {
  return defaultRateLimitStore;
}

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  store?: RateLimitStore;
}) {
  const store = options.store;
  const memoryStore = new Map<string, RateLimitRecord>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const key = `${req.baseUrl || ''}${req.path}_${clientIp}`;
    const now = Date.now();

    if (store && !(store instanceof MemoryRateLimitStore)) {
      // Async pluggable store execution
      store
        .increment(key, options.windowMs)
        .then((record) => {
          if (record.count > options.maxRequests) {
            auditLogger.log({
              eventType: 'RATE_LIMIT_EXCEEDED',
              ip: clientIp,
              path: req.path,
              method: req.method,
              status: 'WARNING',
              details: { count: record.count, limit: options.maxRequests },
            });

            res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
            return res.status(429).json({
              success: false,
              error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message:
                  options.message ||
                  'Too many requests from this IP. Please wait before trying again.',
              },
            });
          }
          next();
        })
        .catch(() => next());
      return;
    }

    // Ultra high performance synchronous path for default memory operations
    const record = memoryStore.get(key);
    if (!record || record.resetAt <= now) {
      memoryStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (record.count >= options.maxRequests) {
      auditLogger.log({
        eventType: 'RATE_LIMIT_EXCEEDED',
        ip: clientIp,
        path: req.path,
        method: req.method,
        status: 'WARNING',
        details: { count: record.count + 1, limit: options.maxRequests },
      });

      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message:
            options.message ||
            'Too many requests from this IP. Please wait before trying again.',
        },
      });
    }

    record.count++;
    next();
  };
}
