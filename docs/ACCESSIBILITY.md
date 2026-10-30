# Celebration Atelier - Accessibility Verification Dossier (WCAG 2.2 AA)

This document certifies that Celebration Atelier has been designed and implemented in conformance with the **Web Content Accessibility Guidelines (WCAG) 2.2 Level AA**.

---

## 1. Executive Summary & Verification Matrix

| WCAG 2.2 AA Principle | Guideline / Criterion | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **1. Perceivable** | 1.1.1 Non-text Content | **PASS** | Charts, SVG readiness rings, and icons have `role="img"`, descriptive `aria-label`, and visually-hidden text summaries (`.sr-only`). |
| | 1.3.1 Info & Relationships | **PASS** | HTML5 landmarks (`<nav>`, `<header>`, `<main id="main-content">`), 1 `<h1>` per page, sequential headings (no skipped levels), table headers have `scope="col"`. |
| | 1.4.1 Use of Color | **PASS** | Badges, status pills, and risk metrics pair color with icons and explicit text; never rely on color alone. |
| | 1.4.3 Contrast (Minimum) | **PASS** | All body text meets >= 4.5:1; UI controls and large text meet >= 3:1 contrast against surface containers. |
| **2. Operable** | 2.1.1 Keyboard Navigation | **PASS** | All interactive elements operable via keyboard with logical tab order; "Skip to main content" link at top of DOM. |
| | 2.1.2 No Keyboard Trap | **PASS** | Modals implement cycle-safe focus traps with `Escape` dismissal and focus restoration to trigger element. |
| | 2.3.3 Animation from Interactions | **PASS** | Framer Motion animations respect user OS preferences via `<MotionConfig reducedMotion="user">`. |
| | 2.4.7 Focus Visible | **PASS** | Universal `:focus-visible` ring styling with 2px offset on all buttons, links, inputs, and sliders. |
| **3. Understandable** | 3.2.1 On Focus | **PASS** | No unexpected context switches or submissions upon receiving keyboard focus. |
| | 3.3.1 Error Identification | **PASS** | Form errors use `role="alert"`, descriptive messages, and input `aria-invalid` bindings. |
| **4. Robust** | 4.1.2 Name, Role, Value | **PASS** | Sliders include `aria-valuemin/max/now/text`, radiogroups have `role="radiogroup"` / `role="radio"`, and modals use `role="dialog"`. |
| | 4.1.3 Status Messages | **PASS** | Dynamic recalculations, AI generation states, and toasts announce via `aria-live="polite"` regions. |

---

## 2. Component-by-Component Conformance

### 2.1 Charts & Visual Telemetry (Readiness Radar, Financials)
- **Role & Labeling**: The Readiness Radar SVG is marked `role="img"` with an `aria-label` detailing the composite readiness score (94%) and breakdown across logistics, vendors, design, and culinary.
- **Alternative Representation**: A "View as Data Table" toggle allows users to view the telemetry data in a fully structured HTML `<table>` with `<th scope="col">` and `<th scope="row">` headers.
- **Progress Bars**: Visual progress indicators (e.g., Committed vs Allocated budget) use `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`, and human-readable `aria-label`.

### 2.2 Interactive Scenario Simulator & Sliders
- **Slider Attributes**: The guest shift range input in `src/pages/BudgetForecast.tsx` is equipped with `id="guest-shift-slider"`, `aria-label="Adjust guest count shift"`, `aria-valuemin="-50"`, `aria-valuemax="50"`, `aria-valuenow={guestShift}`, and dynamic `aria-valuetext` announcing pax count and fiscal impact.
- **Radiogroups**: Decor production tier and beverage curation options use `role="radiogroup"` with `aria-labelledby`, each option having `role="radio"` and `aria-checked`.
- **Live Regions**: Dynamic budgetary recalculations are broadcast to screen readers in real-time through an `aria-live="polite"` region with `aria-atomic="true"`.
- **Screen Reader Summary**: An `.sr-only` table summarizes variables and financial impacts for non-sighted users.

### 2.3 Modals & Dialog System (`src/components/Modal.tsx`)
All dialogs (`AuthModal`, `AddExpenseModal`, `AddTaskModal`, `AddQuoteModal`, `CreateEventModal`, and `ComparisonMatrixModal`) use the unified accessible modal pattern:
1. `role="dialog"` and `aria-modal="true"`.
2. `aria-labelledby` referencing the dialog title ID.
3. **Focus Trap**: Keyboard `Tab` and `Shift+Tab` loop exclusively through focusable elements within the modal.
4. **Focus Restoration**: When the modal closes, focus returns to the exact element that opened it.
5. **Escape Key**: Dismisses the modal immediately.

### 2.4 Reduced Motion
- `<MotionConfig reducedMotion="user">` wraps the application root in `src/App.tsx`.
- Users with `prefers-reduced-motion: reduce` enabled in their operating system will receive non-animated transitions.

### 2.5 Keyboard Navigation & Landmarks
- **Skip Link**: `<a href="#main-content" className="skip-link">Skip to main content</a>` allows keyboard users to bypass navigation.
- **Landmarks**: `<nav aria-label="Main Navigation">`, `<main id="main-content" tabIndex={-1}>`, `<header>`, and `<aside>`.
- **Active Page Indicator**: Active navigation items feature `aria-current="page"`.
- **Form Controls**: Every text input, number field, and select element has an explicit `<label htmlFor="...">` or `aria-label`.

---

## 3. Automated Verification Strategy
1. **ESLint / TypeScript**: Strict types with `--noEmit` asserting clean JSX attributes and no missing properties.
2. **Axe Core Component Tests**: Vitest suite running `axe.run()` against rendered pages asserting 0 violations.
3. **Keyboard Smoke Test**: Validates modal focus trapping and escape closing.
