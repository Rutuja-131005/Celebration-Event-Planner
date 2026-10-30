/**
 * Celebration Atelier — Centralized Enterprise Configuration & Constants
 */

export const AUTH_CONFIG = {
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes lockout
  DEFAULT_TOKEN_EXPIRY_SECONDS: 24 * 60 * 60, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

export const RATE_LIMIT_CONFIG = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 30,
    MESSAGE: 'Too many authentication attempts. Please try again after a few minutes.',
  },
  AI_SYNTHESIS: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 15,
    MESSAGE: 'AI plan generation rate limit exceeded. Please wait a minute before requesting another synthesis.',
  },
  GENERAL_API: {
    WINDOW_MS: 60 * 1000,
    MAX_REQUESTS: 120,
  },
} as const;

export const AI_CONFIG = {
  SYNTHESIS_TIMEOUT_MS: 15000, // 15 seconds cutoff
  CACHE_TTL_MS: 15 * 60 * 1000, // 15 minutes in-memory cache
  DEFAULT_MODEL: 'gemini-3.8-flash',
} as const;

export const BUDGET_DEFAULT_RATIOS = {
  VENUE_AND_LODGING: 0.28,
  CATERING_AND_HOSPITALITY: 0.32,
  DECOR_AND_PRODUCTION: 0.22,
  PHOTOGRAPHY_AND_CINEMA: 0.1,
  ENTERTAINMENT_AND_SOUND: 0.05,
  INVITATIONS_AND_GIFTING: 0.03,
} as const;

export const SCENARIO_SIMULATION_CONFIG = {
  GUEST_SHIFT_COST_PER_PAX_INR: 1500,
  DECOR_TIER_COST_DELTAS: {
    classic: -35000,
    couture: 0,
    regal: 75000,
  },
  BAR_PACKAGE_COST_DELTAS: {
    baseline: 0,
    vintage_champagne: 65000,
  },
} as const;
