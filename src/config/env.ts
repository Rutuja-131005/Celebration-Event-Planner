/**
 * Client Environment Configuration
 * Provides typed access to client-side runtime parameters.
 */

export interface ClientEnv {
  apiBaseUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  appVersion: string;
}

export const clientEnv: ClientEnv = {
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || '/api/v1',
  isProduction: import.meta.env?.PROD ?? false,
  isDevelopment: import.meta.env?.DEV ?? true,
  appVersion: '2.5.0',
};
