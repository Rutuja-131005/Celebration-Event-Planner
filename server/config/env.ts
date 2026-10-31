import { z } from 'zod';
import dotenv from 'dotenv';
import { serverLogger } from '../utils/logger.ts';

dotenv.config();

/**
 * Strict Environment Variable Validation Schema
 * Enforces security requirements, cryptographic secret lengths, and network configuration.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .union([z.string(), z.number()])
    .default('3000')
    .transform((val) => {
      const parsed = typeof val === 'number' ? val : parseInt(val, 10);
      if (isNaN(parsed)) throw new Error('PORT must be an integer');
      return parsed;
    }),
  GEMINI_API_KEY: z.string().optional().default(''),
  SESSION_SECRET: z
    .string()
    .min(16, 'SESSION_SECRET must be at least 16 characters for cryptographic integrity')
    .default('atelier_secure_production_secret_key_2026'),
  ALLOWED_ORIGINS: z.string().default('*'),
  RATE_LIMIT_MAX: z
    .union([z.string(), z.number()])
    .default('100')
    .transform((val) => (typeof val === 'number' ? val : parseInt(val, 10))),
});

export const envSchema = serverEnvSchema;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function validateEnv(): ServerEnv {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.format();
    serverLogger.error('Fatal: Invalid environment configuration detected:', 'Config', {
      errors: errorDetails,
    });
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    // In development, return default parsed object
    return envSchema.parse({
      NODE_ENV: 'development',
      PORT: '3000',
      SESSION_SECRET: 'atelier_development_fallback_secret_key_32bytes',
    });
  }

  return result.data;
}

export const env = validateEnv();
