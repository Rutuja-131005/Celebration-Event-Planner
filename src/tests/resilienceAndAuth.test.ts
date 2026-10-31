import { describe, it, expect, beforeEach } from 'vitest';
import { getDefaultSeedPlan } from '../services/planning.ts';
import { getAuthToken, setAuthToken, clearAuthToken } from '../services/api.ts';
import { serverEnvSchema } from '../../server/config/env.ts';
import {
  formatCurrency,
  formatDate,
  formatPercentage,
  truncateText,
  getInitials,
} from '../utils/formatters.ts';
import {
  calculateBudgetVariance,
  calculateDaysRemaining,
  calculateReadinessIndex,
  computeCategoryAllocations,
  DEFAULT_CATEGORY_WEIGHTS,
} from '../utils/calculations.ts';

describe('1. Deterministic Fallback Synthesis Engine', () => {
  const mockEventId = 'evt_test_resilience_101';

  it('synthesizes a complete deterministic plan when given a valid event id', () => {
    const seedPlan = getDefaultSeedPlan(mockEventId);
    expect(seedPlan).toBeDefined();
    expect(seedPlan.eventId).toBe(mockEventId);
    expect(seedPlan.curationConcept).toBe('Royal Lakeside Mirage');
    expect(seedPlan.planJson).toBeDefined();
  });

  it('ensures budget rebalance and arbitrage insights are populated in fallback plans', () => {
    const seedPlan = getDefaultSeedPlan(mockEventId);
    const budget = seedPlan.planJson?.budgetRebalance;
    expect(budget).toBeDefined();
    expect(budget?.totalBudget).toBe(2500000);
    expect(budget?.catering?.amount).toBeGreaterThan(0);
    expect(budget?.decor?.amount).toBeGreaterThan(0);
    expect(budget?.arbitrageInsight).toBeTruthy();
  });

  it('provides spatial architecture, decibel regulations and sensory notes', () => {
    const seedPlan = getDefaultSeedPlan(mockEventId);
    const spatial = seedPlan.planJson?.spatialBlueprint;
    expect(spatial).toBeDefined();
    expect(spatial?.headline).toBeTruthy();
    expect(spatial?.lightingArchitecture).toBeTruthy();
    expect(spatial?.decibelRegulations).toContain('cutoff');
  });

  it('provides chronological day-of run of show itinerary', () => {
    const seedPlan = getDefaultSeedPlan(mockEventId);
    const itinerary = seedPlan.planJson?.itinerary;
    expect(itinerary).toBeDefined();
    expect(itinerary && itinerary.length).toBeGreaterThanOrEqual(4);

    if (itinerary) {
      for (const step of itinerary) {
        expect(step.time).toBeTruthy();
        expect(step.title).toBeTruthy();
        expect(step.locationTag).toBeTruthy();
        expect(step.description).toBeTruthy();
      }
    }
  });

  it('provides harmonic color palette and culinary ateliers', () => {
    const seedPlan = getDefaultSeedPlan(mockEventId);
    const palette = seedPlan.planJson?.colorPalette;
    expect(palette).toBeDefined();
    expect(palette?.length).toBe(4);

    const culinary = seedPlan.planJson?.culinaryAteliers;
    expect(culinary).toBeDefined();
    expect(culinary && culinary.length).toBeGreaterThanOrEqual(1);
  });
});

describe('2. Authentication Token Management & Headers', () => {
  beforeEach(() => {
    clearAuthToken();
  });

  it('handles empty auth tokens cleanly without throwing', () => {
    expect(getAuthToken()).toBeNull();
  });

  it('persists and retrieves auth token correctly', () => {
    const testToken = 'atelier_jwt_test_token_secret_12345';
    setAuthToken(testToken);
    expect(getAuthToken()).toBe(testToken);
  });

  it('clears token cleanly on logout', () => {
    setAuthToken('test_token_to_clear');
    expect(getAuthToken()).toBeTruthy();
    clearAuthToken();
    expect(getAuthToken()).toBeNull();
  });
});

describe('3. Server Environment Configuration Schema Security', () => {
  it('passes validation when valid secure parameters are provided', () => {
    const validConfig = {
      NODE_ENV: 'test',
      PORT: '3000',
      SESSION_SECRET: 'atelier_ultra_secure_jwt_secret_key_minimum_16_chars',
    };
    const parsed = serverEnvSchema.safeParse(validConfig);
    expect(parsed.success).toBe(true);
  });

  it('rejects SESSION_SECRET that is too short (< 16 characters) to prevent brute-force', () => {
    const weakConfig = {
      NODE_ENV: 'production',
      PORT: '3000',
      SESSION_SECRET: 'short',
    };
    const parsed = serverEnvSchema.safeParse(weakConfig);
    expect(parsed.success).toBe(false);
  });

  it('defaults port to 3000 if not specified', () => {
    const minConfig = {
      SESSION_SECRET: 'atelier_ultra_secure_jwt_secret_key_minimum_16_chars',
    };
    const parsed = serverEnvSchema.safeParse(minConfig);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.PORT).toBe(3000);
    }
  });
});

describe('4. Pure Calculation & Formatter Helpers', () => {
  describe('formatters', () => {
    it('formats currency in Indian Rupees by default', () => {
      const formatted = formatCurrency(2500000);
      expect(formatted).toContain('25,00,000');
    });

    it('formats dates into clean localized representations', () => {
      const formatted = formatDate('2025-12-14');
      expect(formatted).toContain('2025');
      expect(formatted).toContain('14');
    });

    it('formats percentages accurately', () => {
      expect(formatPercentage(45, 100)).toBe(45);
      expect(formatPercentage(100, 100)).toBe(100);
    });

    it('truncates text cleanly with ellipsis', () => {
      expect(truncateText('Hello World Atelier Event Planning', 11)).toBe('Hello World...');
      expect(truncateText('Short', 10)).toBe('Short');
    });

    it('extracts initials reliably', () => {
      expect(getInitials('Rutuja Jadhav')).toBe('RJ');
      expect(getInitials('Celebration')).toBe('CE');
      expect(getInitials('')).toBe('AT');
    });
  });

  describe('calculations', () => {
    it('calculates budget variance correctly', () => {
      const underBudget = calculateBudgetVariance(100000, 80000);
      expect(underBudget.variance).toBe(-20000);
      expect(underBudget.isOverrun).toBe(false);
      expect(underBudget.percentage).toBe(-20);

      const overBudget = calculateBudgetVariance(100000, 125000);
      expect(overBudget.variance).toBe(25000);
      expect(overBudget.isOverrun).toBe(true);
      expect(overBudget.percentage).toBe(25);
    });

    it('calculates days remaining accurately', () => {
      const today = new Date();
      const inFiveDays = new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0];
      expect(calculateDaysRemaining(inFiveDays)).toBeGreaterThanOrEqual(4);
      expect(calculateDaysRemaining(inFiveDays)).toBeLessThanOrEqual(6);
    });

    it('computes category allocations matching exact total', () => {
      const total = 500000;
      const allocations = computeCategoryAllocations(total, DEFAULT_CATEGORY_WEIGHTS);
      const sum = Object.values(allocations).reduce((acc, a) => acc + a, 0);
      expect(sum).toBe(total);
    });

    it('calculates readiness index bounded between 0 and 100', () => {
      const score = calculateReadinessIndex(8, 10, 75);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
