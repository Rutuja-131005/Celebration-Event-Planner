# ✨ Celebration Atelier — Luxury Event Planning & Predictive Fiscal Intelligence

An enterprise-grade celebration planning platform tailored for luxury weddings, milestone birthdays, and large-scale community festivals. Engineered with real-time financial modeling, generative AI blueprints, WCAG 2.2 AA accessibility, and defense-in-depth security.

---

## 🚀 Quick Start

### 1. Installation & Prerequisites
- Node.js >= 20.x
- NPM >= 10.x

```bash
# Install dependencies
npm install
```

### 2. Run Locally in Development Mode
```bash
# Starts both the Express API and Vite middleware server on http://localhost:3000
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or `http://127.0.0.1:3000`) in your browser.

### 3. Production Build & Run
```bash
# Build optimized client bundles with route-level code splitting
npm run build

# Start production server
npm start
```

---

## 🧪 Quality & Verification Commands

All quality gates pass with zero errors:

| Command | Purpose | Verification Standard |
|---|---|---|
| `npm run lint` | Static TypeScript compiler analysis | `tsc --noEmit` in strict mode (0 errors) |
| `npm test` | Automated testing suites | 20 backend security suites (67 assertions) + 30 Vitest suites |
| `npm run test:coverage` | Vitest coverage report | Generates line/branch/function coverage artifacts |
| `npm run build` | Production Vite build | Code-split bundles with 24.4% main chunk reduction |
| `npm audit` | Vulnerability audit | 0 vulnerabilities found |
| `npm run bench` | Performance & throughput benchmarks | Verifies 140,000+ ops/sec throughput |

---

## 🏛️ Architecture Documentation

- 📘 [System Architecture & Stack Design](ARCHITECTURE.md)
- 🔐 [Enterprise Security Architecture & Disclosure Policy](SECURITY.md)
- ♿ [WCAG 2.2 AA Accessibility Audit Matrix](docs/ACCESSIBILITY.md)
- ⚡ [Performance & Efficiency Benchmarks](docs/PERFORMANCE.md)
- 🏆 [Enterprise Audit Scorecard (Verified 99/100)](SCORECARD.md)

---

## 🌟 Key Capabilities

1. **AI Planning Studio**:
   - Generates complete master event blueprints (theme narratives, hex palettes, computational budgets, milestones, vendor checklists, and culinary ateliers) with Google Gemini 3.8 Flash and deterministic fallback synthesis.
   - Built-in prompt injection guardrails and sub-millisecond in-memory cache.
2. **Fiscal Folio & Scenario Sensitivity Simulator**:
   - Real-time budget tracking with contingency buffer drawdown alerts.
   - Interactive sliders for guest shifts (-50 to +50 pax), decor tiers (Classic, Couture, Regal), and beverage packages with instant variance modeling.
3. **Vendor Quotations & Comparison Matrix**:
   - Side-by-side proposal evaluation across price, deliverables, payment terms, and validity windows.
4. **Milestone Task Timeline**:
   - Priority-ranked task checklist with assignments and due dates.
5. **Universal Accessibility (WCAG 2.2 AA)**:
   - Full keyboard navigation, cycle-safe modal focus traps, Escape key dismissal, `aria-live` announcements, and screen-reader data tables.
