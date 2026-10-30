# 🔐 Security Architecture & Policy — Celebration Atelier

Celebration Atelier enforces defense-in-depth across the entire application stack, adhering to **OWASP ASVS Level 2+**, **NIST 800-63B**, and strict enterprise governance standards.

---

## 1. Vulnerability Disclosure Policy

We take security issues seriously. If you identify a vulnerability in Celebration Atelier:
1. **Responsible Disclosure**: Email our dedicated security team at `security@celebration-atelier.internal` or file an encrypted confidential report.
2. **Do Not Exploit**: Please refrain from degrading user experience, disrupting production systems, or accessing private data during testing.
3. **Response SLA**:
   - Initial triage acknowledgement within **24 hours**.
   - Remediation advisory within **72 hours**.
   - Coordinated public disclosure once patches are verified.

---

## 2. Threat Model & Control Matrix

| Threat Category | Potential Risk | Implemented Defense Mechanism | Verification |
|---|---|---|---|
| **Broken Authentication** | Credential stuffing, brute-force dictionary attacks | `scrypt` hashing with unique salt; per-account failed attempt tracking (5 failed logins triggers automatic 15-minute lockout); generic error responses preventing username enumeration. | Automated test suite in `src/tests/securityHardening.test.ts` |
| **Session Hijacking / Replay** | Replaying captured JWTs after user sign-out | Dynamic HMAC-SHA256 tokens embedded with unique cryptographic `jti` (JWT ID); centralized denylist store (`revokeToken`) upon logout; mandatory expiration (`exp`). | Denylist integration tests |
| **Privilege Escalation** | Self-assigning unauthorized administrative roles | Server-side role sanitization rejecting client role self-elevation (restricting registrations to `Event Planner` or `Client`). | Backend Suite 15 in `server/tests/api.test.ts` |
| **Insecure Direct Object Reference (IDOR)** | Accessing or deleting events belonging to another planner/client | Strict server-side ownership and role checks (`ownerUserId === req.user.id` or `Lead Planner`). | Backend Suite 16 in `server/tests/api.test.ts` |
| **Mass Assignment & Parameter Injection** | Injecting hidden fields (`isAdmin: true`) | Centralized **Zod schemas in strict mode** (`.strict()`), immediately rejecting any unmodeled attributes. | Unit tests in `src/tests/securityHardening.test.ts` |
| **Prompt Injection & AI Jailbreak** | Malicious system prompt override or persona manipulation | Regex token sanitization (`/ignore.*previous.*instructions/i`, `/you are now dan/i`), strict output schema enforcement, deterministic fallback fallback. | Backend Suite 18 in `server/tests/api.test.ts` |
| **Denial of Service / Resource Exhaustion** | API flooding & credential spraying | Pluggable `RateLimitStore` supporting both in-memory high-throughput sliding windows and enterprise `RedisRateLimitStore` (`REDIS_URL`). | Rate limiter tests & benchmarks |
| **Cross-Site Scripting (XSS) & Clickjacking** | Malicious iframe framing or script injection | Strict Content Security Policy (`CSP`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and zero inline scripts in production. | Headers assertion suite |
| **Data Leakage & PII Exposure** | Credentials or sensitive personal info in logs | Automated recursive PII/credential redactor (`server/utils/auditLogger.ts`) stripping passwords, tokens, API keys, and masking client emails. | Audit redaction tests |

---

## 3. Cryptographic Standards

- **Password Storage**: Key derivation via Node.js `crypto.scryptSync` (64-byte derived key, 16-byte random salt, constant-time `crypto.timingSafeEqual` comparison).
- **Session Tokens**: Cryptographically signed HMAC-SHA256 tokens (`atelier_sec_...`) with unique `jti` UUIDs.
- **Production Guardrail**: In production (`NODE_ENV === 'production'`), startup asserts that `SESSION_SECRET` is strong (min 32 characters, non-default); falls back safely to ephemeral 256-bit entropy if unconfigured.

---

## 4. HTTP Security Headers

Every response dispatched by Celebration Atelier includes hardened security headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: https://api.dicebear.com; connect-src 'self' https://generativelanguage.googleapis.com https://api.dicebear.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';
```

---

## 5. Security Audit Verification

Run the full security test suite:
```bash
npm test
```
Run static type analysis and security dependency audit:
```bash
npm run lint
npm audit
```
