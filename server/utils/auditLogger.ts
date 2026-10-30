import fs from 'fs';
import path from 'path';

export interface AuditEvent {
  timestamp: string;
  eventType:
    | 'AUTH_LOGIN_SUCCESS'
    | 'AUTH_LOGIN_FAILURE'
    | 'AUTH_LOGOUT'
    | 'AUTH_LOCKOUT'
    | 'AUTH_REGISTER'
    | 'ROLE_ESCALATION_ATTEMPT'
    | 'IDOR_ACCESS_ATTEMPT'
    | 'SECURITY_TOKEN_REVOKED'
    | 'PROMPT_INJECTION_DETECTED'
    | 'RESOURCE_MUTATION'
    | 'RATE_LIMIT_EXCEEDED';
  userId?: string;
  ip?: string;
  path?: string;
  method?: string;
  status: 'SUCCESS' | 'FAILURE' | 'WARNING' | 'ALERT';
  details?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'authorization',
  'sessionsecret',
  'jwtsecret',
  'apikey',
  'gemini_api_key',
  'creditcard',
  'secret',
]);

/**
 * Redact sensitive PII and credential fields recursively
 */
export function redactPII(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Redact email addresses partially: a***@example.com
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj)) {
      const parts = obj.split('@');
      const user = parts[0];
      const domain = parts[1];
      if (user && domain) {
        const maskedUser = user.length > 2 ? `${user.substring(0, 1)}***${user.slice(-1)}` : `${user[0] || '*'}***`;
        return `${maskedUser}@${domain}`;
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactPII);
  }

  if (typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lower) || lower.includes('password') || lower.includes('secret') || lower.includes('token')) {
        redacted[key] = '[REDACTED_SECRET]';
      } else {
        redacted[key] = redactPII(val);
      }
    }
    return redacted;
  }

  return obj;
}

// In-memory audit trail buffer (capped at 1000 events)
const inMemoryAuditTrail: AuditEvent[] = [];
const MAX_IN_MEMORY_LOGS = 1000;

export const auditLogger = {
  log(event: Omit<AuditEvent, 'timestamp'>): AuditEvent {
    const fullEvent: AuditEvent = {
      timestamp: new Date().toISOString(),
      eventType: event.eventType,
      userId: event.userId,
      ip: event.ip,
      path: event.path,
      method: event.method,
      status: event.status,
      details: redactPII(event.details) as Record<string, unknown>,
    };

    inMemoryAuditTrail.unshift(fullEvent);
    if (inMemoryAuditTrail.length > MAX_IN_MEMORY_LOGS) {
      inMemoryAuditTrail.pop();
    }

    // Output formatted structured log to console in non-test mode or security alerts
    if (event.status === 'ALERT' || process.env.NODE_ENV !== 'test') {
      const level = event.status === 'ALERT' || event.status === 'FAILURE' ? 'warn' : 'info';
      console[level](`[AUDIT] [${fullEvent.timestamp}] [${fullEvent.eventType}] [${fullEvent.status}]`, JSON.stringify(fullEvent));
    }

    return fullEvent;
  },

  getRecentLogs(limit = 100): AuditEvent[] {
    return inMemoryAuditTrail.slice(0, limit);
  },

  clear(): void {
    inMemoryAuditTrail.length = 0;
  },
};
