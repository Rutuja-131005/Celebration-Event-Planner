# ⚡ Performance & Efficiency Architecture — Celebration Atelier

This document records the architectural optimizations, benchmarks, code-splitting strategies, and persistence mechanisms that ensure Celebration Atelier performs with sub-millisecond computation latencies and 60 FPS UI rendering.

---

## 1. Verified Micro-Benchmark Results

Run command:
```bash
npm run bench
```

**Environment:**
- Node.js: `v22.17.0`
- Architecture: `x64`
- Iterations: 10,000 runs per suite

| Benchmark Suite | Iterations | Total Time (ms) | Throughput (Ops / Sec) | Average Latency (ms) |
|---|---|---|---|---|
| **Budget Metrics Engine Calculation** | 10,000 | 70.91 ms | **141,015 ops/sec** | 0.0071 ms |
| **Scenario Sensitivity Simulation Engine** | 10,000 | 68.86 ms | **145,228 ops/sec** | 0.0069 ms |
| **Cryptographic HMAC-SHA256 Token Verification** | 10,000 | 256.93 ms | **38,921 ops/sec** | 0.0257 ms |
| **Strict Zod Payload Validation (`.strict()`)** | 10,000 | 70.95 ms | **140,936 ops/sec** | 0.0071 ms |
| **Control Character Input Sanitization** | 10,000 | 5.43 ms | **1,842,028 ops/sec** | 0.0005 ms |

All computational operations comfortably meet the enterprise SLA budget of **< 0.1 ms per operation**.

---

## 2. Frontend Efficiency & Code Splitting

1. **Route-Level Code Splitting (`React.lazy` + `Suspense`)**:
   - Primary high-traffic pages (`Overview`, `BudgetForecast`) are loaded eagerly for near-instant First Contentful Paint (FCP).
   - Secondary and heavy pages (`AIPlanningStudio`, `VendorsQuotations`, `TimelineTasks`, `MyEvents`, `IdeasInspiration`, `ReportsInsights`, `Settings`) are code-split into on-demand chunks.
   - Screen-reader accessible `<PageLoadingFallback />` with `role="status"` and `aria-live="polite"` prevents layout shifts during chunk hydration.

2. **Memoization & Re-render Prevention**:
   - In `src/pages/BudgetForecast.tsx`, heavy calculations (guest variance impact, decor tier adjustments, buffer drawdown flags, and filtered expenses) are wrapped in `React.useMemo`.
   - Scenario slider operations run smoothly without unnecessary component tree re-evaluations.

3. **Motion Preferences**:
   - Wrapped in `<MotionConfig reducedMotion="user">` to respect user OS accessibility preferences and reduce GPU paint cycles.

---

## 3. Network & HTTP Caching Strategy

1. **Static Asset Caching**:
   - Static bundles (`dist/assets/*.js`, `dist/assets/*.css`) are fingerprinted and served with:
     ```http
     Cache-Control: public, max-age=31536000, immutable
     ```
   - HTML documents are served with:
     ```http
     Cache-Control: no-cache, no-store, must-revalidate
     ```
2. **Conditional Requests & ETag Support**:
   - Strong ETags (`app.set('etag', 'strong')`) are generated for API responses.
   - Browser conditional GET requests (`If-None-Match`) return `304 Not Modified`, minimizing bandwidth consumption.

---

## 4. AI Synthesis Timeout & Fast Caching

1. **In-Memory Cache (15m TTL)**:
   - Synthesis requests for identical event briefs are cached in `aiService.ts`.
   - Repeated prompt requests execute in `< 1ms` without consuming LLM API token quotas.
2. **15-Second Hard Timeout**:
   - `Promise.race([client.models.generateContent(...), timeoutPromise])` enforces a 15-second cutoff.
   - If upstream AI providers experience latency spikes, the engine immediately yields high-fidelity deterministic synthesis without hanging HTTP client connections.

---

## 5. Atomic Persistence Architecture

- Database state transitions serialize through an in-memory `writeQueue` in `server/db/database.ts`.
- Changes are written to a unique temporary file (`atelier_db.json.<timestamp>.<rand>.tmp`) and atomically renamed via `fs.promises.rename` / `fs.renameSync`.
- This eliminates partial-write corruption even under concurrent multi-threaded writes (verified in Suite 19 of `server/tests/api.test.ts`).
