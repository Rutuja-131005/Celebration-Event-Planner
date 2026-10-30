import { describe, it, expect, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  revokeToken,
  isTokenRevoked,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLogins,
  MemoryRateLimitStore,
} from '../../server/utils/security.ts';
import { redactPII, auditLogger } from '../../server/utils/auditLogger.ts';
import {
  authRegisterSchema,
  authLoginSchema,
  createEventSchema,
  createExpenseSchema,
  createQuoteSchema,
} from '../../server/validation/schemas.ts';

describe('Phase 3: Enterprise Security Hardening Test Suite', () => {
  beforeEach(() => {
    resetFailedLogins('test_attacker@atelier.com');
    resetFailedLogins('victim@atelier.com');
  });

  describe('1. Pluggable RateLimitStore & Storage Interface', () => {
    it('MemoryRateLimitStore accurately increments count and respects windowMs', async () => {
      const store = new MemoryRateLimitStore();
      const key = 'rate_key_test_1';

      const first = await store.increment(key, 5000);
      expect(first.count).toBe(1);
      expect(first.resetAt).toBeGreaterThan(Date.now());

      const second = await store.increment(key, 5000);
      expect(second.count).toBe(2);

      const retrieved = await store.get(key);
      expect(retrieved?.count).toBe(2);

      await store.reset(key);
      const afterReset = await store.get(key);
      expect(afterReset).toBeNull();
    });
  });

  describe('2. Account Lockout & Brute-Force Throttling', () => {
    it('locks account after 5 consecutive failed login attempts', () => {
      const email = 'victim@atelier.com';
      expect(checkAccountLockout(email).isLocked).toBe(false);

      // 4 failed attempts should not lock yet
      for (let i = 1; i <= 4; i++) {
        const res = recordFailedLogin(email);
        expect(res.isLocked).toBe(false);
        expect(res.remainingAttempts).toBe(5 - i);
      }

      // 5th failed attempt locks the account
      const fifth = recordFailedLogin(email);
      expect(fifth.isLocked).toBe(true);
      expect(fifth.remainingAttempts).toBe(0);

      // Lockout status check
      const status = checkAccountLockout(email);
      expect(status.isLocked).toBe(true);
      expect(status.remainingSeconds).toBeGreaterThan(0);

      // Successful reset unlocks account
      resetFailedLogins(email);
      expect(checkAccountLockout(email).isLocked).toBe(false);
    });
  });

  describe('3. Token Denylist & Cryptographic Revocation', () => {
    it('token contains unique jti and can be explicitly revoked', () => {
      const mockUser = {
        id: 'usr_sec_test',
        email: 'planner@atelier.com',
        role: 'Event Planner',
      };

      const token = createToken(mockUser, 3600);
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe(mockUser.id);
      expect(payload?.jti).toBeDefined();

      const jti = payload!.jti;
      expect(isTokenRevoked(jti)).toBe(false);

      // Revoke token
      revokeToken(jti);
      expect(isTokenRevoked(jti)).toBe(true);

      // Re-verifying the same token now returns null
      const verifiedAfterRevoke = verifyToken(token);
      expect(verifiedAfterRevoke).toBeNull();
    });

    it('rejects tampered or forged tokens with invalid signatures', () => {
      const mockUser = { id: 'usr_sec_1', email: 'test@atelier.com', role: 'Client' };
      const token = createToken(mockUser);

      // Tamper signature
      const tampered = token.slice(0, -5) + 'xxxxx';
      expect(verifyToken(tampered)).toBeNull();
    });
  });

  describe('4. Centralized Strict Zod Schemas & Mass Assignment Defense', () => {
    it('authRegisterSchema rejects extraneous unexpected properties (.strict())', () => {
      const payloadWithInjection = {
        name: 'Attacker',
        email: 'attacker@atelier.com',
        password: 'Password123!',
        role: 'Client',
        isAdmin: true, // Malicious parameter injection
        superuser: true,
      };

      const result = authRegisterSchema.safeParse(payloadWithInjection);
      expect(result.success).toBe(false);
    });

    it('authRegisterSchema rejects passwords under 8 characters', () => {
      const shortPass = {
        name: 'Alice',
        email: 'alice@atelier.com',
        password: 'short',
      };
      const result = authRegisterSchema.safeParse(shortPass);
      expect(result.success).toBe(false);
    });

    it('createExpenseSchema requires positive amounts and description', () => {
      const invalidExpense = {
        description: '',
        actualAmount: -500,
      };
      const result = createExpenseSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);

      const validExpense = {
        description: 'Floral stage installation',
        actualAmount: 150000,
      };
      const validResult = createExpenseSchema.safeParse(validExpense);
      expect(validResult.success).toBe(true);
    });
  });

  describe('5. PII and Credential Redaction in Audit Trail', () => {
    it('redacts sensitive credentials, tokens, and obfuscates emails', () => {
      const sensitiveData = {
        password: 'SuperSecretPassword!',
        token: 'atelier_sec_header.sig',
        secret: 'prod_jwt_secret',
        apiKey: 'AIzaSyDemoKey',
        userEmail: 'priyasharma@atelier.com',
        clientName: 'Rohan Verma',
        metadata: {
          creditCard: '4111222233334444',
          nestedSecret: 'deep_secret',
        },
      };

      const redacted = redactPII(sensitiveData) as any;
      expect(redacted.password).toBe('[REDACTED_SECRET]');
      expect(redacted.token).toBe('[REDACTED_SECRET]');
      expect(redacted.secret).toBe('[REDACTED_SECRET]');
      expect(redacted.apiKey).toBe('[REDACTED_SECRET]');
      expect(redacted.userEmail).toBe('p***a@atelier.com');
      expect(redacted.clientName).toBe('Rohan Verma');
      expect(redacted.metadata.creditCard).toBe('[REDACTED_SECRET]');
      expect(redacted.metadata.nestedSecret).toBe('[REDACTED_SECRET]');
    });

    it('auditLogger records events and retains in recent memory buffer', () => {
      auditLogger.clear();
      auditLogger.log({
        eventType: 'AUTH_LOGIN_SUCCESS',
        userId: 'usr_test_1',
        status: 'SUCCESS',
        details: { email: 'planner@atelier.com' },
      });

      const recent = auditLogger.getRecentLogs(5);
      expect(recent.length).toBeGreaterThan(0);
      expect(recent[0].eventType).toBe('AUTH_LOGIN_SUCCESS');
      expect(recent[0].status).toBe('SUCCESS');
    });
  });
});
