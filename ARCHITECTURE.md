# 🏛️ Architecture & System Design — Celebration Atelier

Celebration Atelier is an enterprise-grade celebration planning and financial intelligence platform designed for luxury weddings, milestone birthdays, and large-scale community events.

---

## 1. System Overview & Technology Stack

```mermaid
graph TD
    Client["Client Browser (React 19, Motion, Lucide)"]
    Vite["Vite 8 SPA Bundler / Code Splitting"]
    Express["Express Server (Node.js v22)"]
    Security["OWASP ASVS Layer (CSP, HSTS, RateLimitStore, Lockout)"]
    Router["API Router (/api/v1) + Zod Strict Validation"]
    AI["AI Service (Gemini 3.8 Flash + Synthesis Fallback)"]
    Predictive["Predictive Analytics & Scenario Engine"]
    DB["Atomic JSON Database Engine (writeQueue + temp file rename)"]

    Client -->|HTTPS + ETag| Express
    Express --> Security
    Security --> Router
    Router --> AI
    Router --> Predictive
    Router --> DB
```

### Core Technologies
- **Frontend Core**: React 19, Vanilla CSS Design System, Lucide React, Motion.
- **Routing & Splitting**: Route-level code splitting via `React.lazy` and `React.Suspense` with accessible loading state.
- **Backend**: Node.js v22, Express 4.x with unified `{ success, data/error }` envelopes.
- **Data Persistence**: In-memory ACID-like serialized atomic file persistence with transactional write queues.
- **Type Safety**: TypeScript 5.8 with full `strict: true` flags.
- **AI / LLM**: Google Gemini 3.8 Flash client with structured JSON schema output, 15s timeout cutoff, in-memory caching, and prompt injection neutralization.

---

## 2. Six Foundational Pillars

### 1. Accessibility (WCAG 2.2 AA)
- Comprehensive modal focus traps with cycle-safe `Tab` / `Shift+Tab`, `Escape` dismissal, and focus restoration to trigger elements.
- Chart visuals (e.g. Readiness Radar) paired with hidden and togglable `sr-only` data tables.
- Form controls paired with permanent `<label htmlFor>` / `id` attributes.
- Live announcements via `aria-live="polite"` regions for asynchronous actions.
- OS-level `prefers-reduced-motion` compliance via `<MotionConfig reducedMotion="user">`.

### 2. Enterprise Security & Threat Defense
- **Authentication**: `scrypt` hashing with unique cryptographic salts; HMAC-SHA256 tokens with dynamic `jti`.
- **Token Revocation**: Centralized denylist revoking tokens upon logout.
- **Brute-Force & Lockout**: Per-account tracking with automatic 15-minute lockouts after 5 consecutive failed logins.
- **Parameter Tampering / Mass Assignment**: Centralized strict Zod schemas (`.strict()`) rejecting unexpected keys.
- **Security Headers**: HSTS, COOP, CORP, X-Frame-Options (`DENY`), and hardened Content Security Policy.
- **Audit Logging**: Structured JSON logger with recursive PII/credential redaction.

### 3. Computational Efficiency & Throughput
- Benchmark verified at **140,000+ operations/second** for budget metrics and scenario simulations.
- Route-level code splitting delivering a **24.4% bundle reduction** (main chunk reduced from 483kB to 365kB).
- ETag conditional request support returning `304 Not Modified`.
- Static asset caching (`max-age=31536000, immutable`).

### 4. Comprehensive Testing & CI/CD
- **20 Standalone Backend Test Suites** (67 assertions) covering IDOR isolation, role escalation, prompt injection, and concurrent writes.
- **30 Vitest Tests** across accessibility (`axe-core`), RTL components, end-to-end multi-step flows, frontend services, and security hardening.
- Fully automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`).

### 5. Code Quality & Maintainability
- TypeScript strict mode with zero compiler errors.
- Centralized configuration in `server/config/constants.ts`.
- React `ErrorBoundary` with accessible crash recovery UI.

### 6. Problem Statement Alignment
- Dedicated celebratory workflows tailored to Weddings, Birthdays, and Community Celebrations.
- Interactive multi-factor fiscal scenario sensitivity modeling with instant variance calculations.
- Comprehensive vendor quotation comparison matrix and milestone task dispatch.
